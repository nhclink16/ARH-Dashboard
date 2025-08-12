// Simple Rent Roll import without external dependencies
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// SECURE: Use environment variables - NEVER hardcode keys!
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.error('Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_new_key_here');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function parseManagementEndDate(propertyName) {
  const match = propertyName.match(/\(Last Day MGT (\d{2})-(\d{2})-(\d{2})\)/);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = `20${year}`;
    return `${fullYear}-${month}-${day}`;
  }
  return null;
}

async function createTable() {
  console.log('🗄️ Creating rent_roll table...');
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      DROP TABLE IF EXISTS rent_roll;
      
      CREATE TABLE rent_roll (
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
  
  if (error) {
    console.error('❌ Error creating table:', error);
    return false;
  }
  
  console.log('✅ Table created successfully');
  return true;
}

async function importCSV() {
  console.log('📊 Starting Rent Roll import...');
  
  // Create table first
  const tableCreated = await createTable();
  if (!tableCreated) return;
  
  try {
    const csvContent = fs.readFileSync('/Users/nicholascaron/Downloads/Rent_Roll.csv', 'utf-8');
    const lines = csvContent.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    console.log(`📋 Headers found: ${headers.join(', ')}`);
    console.log(`📦 Processing ${lines.length - 1} data rows...`);
    
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length < headers.length) continue;
      
      const record = {
        property_name: values[0] || '',
        unit_number: values[1] || '',
        square_footage: parseInt(values[2]) || null,
        bed_bath: values[3] || '',
        residents: values[4] || 'VACANT',
        lease_start_raw: values[5] || '',
        lease_end_raw: values[6] || '',
        lease_start: parseDate(values[7]),
        lease_end: parseDate(values[8]),
        market_rent: parseFloat(values[9]) || 0,
        prepayments: parseFloat(values[10]) || 0,
        lease_id: values[11] || '',
        is_eviction_pending: parseInt(values[12]) || 0,
        building_type_id: parseInt(values[13]) || null,
        rent: parseFloat(values[14]) || 0,
        recurring_charges: parseFloat(values[15]) || 0,
        recurring_credits: parseFloat(values[16]) || 0,
        total: parseFloat(values[17]) || 0,
        has_sub_items: values[18] || '',
        balance: parseFloat(values[19]) || 0,
        security_deposit: parseFloat(values[20]) || 0,
        is_occupied: values[4] && values[4].trim() !== 'VACANT',
        is_ending_management: values[0].includes('Last Day MGT'),
        management_end_date: parseManagementEndDate(values[0]),
        property_type: parseInt(values[13]) === 1 ? 'SFR' : 'MF'
      };
      
      records.push(record);
    }
    
    console.log(`🔄 Inserting ${records.length} records...`);
    
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase.from('rent_roll').insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
      }
    }
    
    // Generate summary
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
    
    const totalRent = records.filter(r => r.is_occupied && r.rent > 0).reduce((sum, r) => sum + r.rent, 0);
    console.log(`Total Monthly Rent Roll: $${totalRent.toLocaleString()}`);
    
    const avgRent = occupied > 0 ? totalRent / occupied : 0;
    console.log(`Average Rent: $${Math.round(avgRent)}`);
    
    const activeTotalRent = records.filter(r => r.is_occupied && !r.is_ending_management && r.rent > 0).reduce((sum, r) => sum + r.rent, 0);
    const activeOccupied = records.filter(r => r.is_occupied && !r.is_ending_management).length;
    console.log(`\n🎯 ACTIVE PROPERTIES ONLY (excluding ending management):`);
    console.log(`Active Rent Roll: $${activeTotalRent.toLocaleString()}`);
    console.log(`Active Occupied Units: ${activeOccupied}`);
    console.log(`Active Average Rent: $${activeOccupied > 0 ? Math.round(activeTotalRent / activeOccupied) : 0}`);
    
  } catch (error) {
    console.error('❌ Import error:', error);
  }
}

importCSV();