import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initializeData() {
  console.log('Initializing Augusta Metrics data...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('metrics').select('count(*)', { count: 'exact' });
    if (error) {
      console.error('Database connection failed:', error.message);
      console.log('Please create the tables manually using the SQL Editor in Supabase dashboard');
      return;
    }
    
    console.log('Database connected successfully!');
    console.log(`Found ${data?.[0]?.count || 0} existing metrics`);
    
    // Initialize with sample operational data
    const operationalMetrics = [
      { metric_type: 'occupancy_rate', property_type: 'total', value: 94.2, string_value: '94.2%', category: 'operational' },
      { metric_type: 'occupancy_rate', property_type: 'sfr', value: 95.1, string_value: '95.1%', category: 'operational' },
      { metric_type: 'occupancy_rate', property_type: 'mf', value: 93.8, string_value: '93.8%', category: 'operational' },
      { metric_type: 'total_rent_roll', property_type: 'total', value: 2847500, string_value: '$2,847,500', category: 'operational' },
      { metric_type: 'average_rent', property_type: 'total', value: 1898, string_value: '$1,898', category: 'operational' },
      { metric_type: 'google_reviews', property_type: 'total', value: 847, string_value: '847', category: 'operational' },
      { metric_type: 'google_reviews_rating', property_type: 'total', value: 4.3, string_value: '4.3/5.0', category: 'operational' },
    ];
    
    // Insert metrics with upsert to avoid duplicates
    for (const metric of operationalMetrics) {
      const { error } = await supabase
        .from('metrics')
        .upsert(metric, { onConflict: 'metric_type,property_type' });
      
      if (error) {
        console.error(`Error inserting ${metric.metric_type}:`, error.message);
      } else {
        console.log(`✓ Initialized ${metric.metric_type} (${metric.property_type})`);
      }
    }
    
    console.log('Data initialization completed!');
    
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

initializeData();