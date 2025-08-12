// Import Rent Roll CSV into Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function parseManagementEndDate(propertyName) {
  // Extract date from "(Last Day MGT 07-15-25)" format
  const match = propertyName.match(/\(Last Day MGT (\d{2})-(\d{2})-(\d{2})\)/);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = `20${year}`;
    return `${fullYear}-${month}-${day}`;
  }
  return null;
}

function determinePropertyType(buildingTypeId, propertyName) {
  // Based on observations:
  // BuildingTypeId 2 = MF (apartments/townhomes)
  // BuildingTypeId 1 = likely SFR
  if (buildingTypeId === 2) return 'MF';
  if (buildingTypeId === 1) return 'SFR';
  
  // Fallback: check property name
  if (propertyName.toLowerCase().includes('apartment') || 
      propertyName.toLowerCase().includes('townhome') ||
      propertyName.toLowerCase().includes('complex')) {
    return 'MF';
  }
  return 'SFR';
}

async function importRentRoll(csvPath) {
  console.log('📊 Starting Rent Roll import...');
  
  // First, create the table
  console.log('🗄️ Creating rent_roll table...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS rent_roll (
        id SERIAL PRIMARY KEY,
        property_name VARCHAR(255),
        unit_number VARCHAR(50),
        square_footage INTEGER,
        bed_bath VARCHAR(50),
        residents TEXT,
        lease_start_raw VARCHAR(50),
        lease_end_raw VARCHAR(50),
        lease_start DATE,
        lease_end DATE,
        market_rent DECIMAL(10,2),
        prepayments DECIMAL(10,2),
        lease_id VARCHAR(50),
        is_eviction_pending INTEGER,
        building_type_id INTEGER,
        rent DECIMAL(10,2),
        recurring_charges DECIMAL(10,2),
        recurring_credits DECIMAL(10,2),
        total DECIMAL(10,2),
        has_sub_items TEXT,
        balance DECIMAL(10,2),
        security_deposit DECIMAL(10,2),
        is_occupied BOOLEAN,
        is_ending_management BOOLEAN,
        management_end_date DATE,
        property_type VARCHAR(10),
        import_date TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (createError) {
    console.error('❌ Error creating table:', createError);
    return;
  }
  
  // Clear existing data
  console.log('🗑️ Clearing existing rent roll data...');
  await supabase.from('rent_roll').delete().neq('id', 0);
  
  const records = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ 
        headers: true,
        skip_empty_lines: true,
        columns: [
          'PropertyName', 'number', 'squareFootage', 'BedBath', 'Residents',
          'LeaseStartRaw', 'LeaseEndRaw', 'Start', 'End', 'MarketRent',
          'Prepayments', 'leaseId', 'isEvictionPending', 'BuildingTypeId',
          'rent', 'recurringCharges', 'recurringCredits', 'total',
          'hasSubItems', 'balance', 'SecurityDeposit'
        ]
      }))
      .on('data', (row) => {
        const record = {
          property_name: row.PropertyName || '',
          unit_number: row.number || '',
          square_footage: parseInt(row.squareFootage) || null,
          bed_bath: row.BedBath || '',
          residents: row.Residents || 'VACANT',
          lease_start_raw: row.LeaseStartRaw || '',
          lease_end_raw: row.LeaseEndRaw || '',
          lease_start: parseDate(row.Start),
          lease_end: parseDate(row.End),
          market_rent: parseFloat(row.MarketRent) || 0,
          prepayments: parseFloat(row.Prepayments) || 0,
          lease_id: row.leaseId || '',
          is_eviction_pending: parseInt(row.isEvictionPending) || 0,
          building_type_id: parseInt(row.BuildingTypeId) || null,
          rent: parseFloat(row.rent) || 0,
          recurring_charges: parseFloat(row.recurringCharges) || 0,
          recurring_credits: parseFloat(row.recurringCredits) || 0,
          total: parseFloat(row.total) || 0,
          has_sub_items: row.hasSubItems || '',
          balance: parseFloat(row.balance) || 0,
          security_deposit: parseFloat(row.SecurityDeposit) || 0,
          is_occupied: row.Residents && row.Residents.trim() !== 'VACANT',
          is_ending_management: row.PropertyName.includes('Last Day MGT'),
          management_end_date: parseManagementEndDate(row.PropertyName),
          property_type: determinePropertyType(parseInt(row.BuildingTypeId), row.PropertyName)
        };
        
        records.push(record);
      })
      .on('end', async () => {
        console.log(`📦 Parsed ${records.length} records from CSV`);
        
        // Insert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const { error } = await supabase.from('rent_roll').insert(batch);
          
          if (error) {
            console.error(`❌ Error inserting batch ${i}-${i + batchSize}:`, error);
          } else {
            console.log(`✅ Inserted records ${i + 1}-${Math.min(i + batchSize, records.length)}`);
          }
        }
        
        // Generate summary statistics
        console.log('\n📊 RENT ROLL IMPORT SUMMARY:');
        console.log(`Total Units: ${records.length}`);
        
        const occupied = records.filter(r => r.is_occupied).length;
        const vacant = records.length - occupied;
        console.log(`Occupied: ${occupied} (${(occupied/records.length*100).toFixed(1)}%)`);
        console.log(`Vacant: ${vacant} (${(vacant/records.length*100).toFixed(1)}%)`);
        
        const endingMgmt = records.filter(r => r.is_ending_management).length;
        console.log(`Ending Management: ${endingMgmt} units`);
        
        const sfr = records.filter(r => r.property_type === 'SFR').length;
        const mf = records.filter(r => r.property_type === 'MF').length;
        console.log(`Property Types: ${sfr} SFR, ${mf} MF`);
        
        const totalRent = records.filter(r => r.is_occupied).reduce((sum, r) => sum + (r.rent || 0), 0);
        console.log(`Total Monthly Rent Roll: $${totalRent.toLocaleString()}`);
        
        const avgRent = occupied > 0 ? totalRent / occupied : 0;
        console.log(`Average Rent: $${Math.round(avgRent)}`);
        
        resolve();
      })
      .on('error', reject);
  });
}

// Run the import
const csvPath = '/Users/nicholascaron/Downloads/Rent_Roll.csv';
importRentRoll(csvPath).catch(console.error);