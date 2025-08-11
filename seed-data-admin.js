import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDataWithRLSDisabled() {
  try {
    console.log('Starting data seeding...');

    // Step 1: Temporarily disable RLS
    console.log('Temporarily disabling RLS...');
    
    // Step 2: Insert metrics data using raw SQL to bypass RLS
    console.log('Inserting metrics data...');
    
    const metricsInsertSQL = `
      INSERT INTO metrics (metric_type, property_type, value, string_value, category) VALUES 
      ('occupancy_rate', 'total', 94.2, '94.2%', 'operational'),
      ('occupancy_rate', 'sfr', 95.1, '95.1%', 'operational'),
      ('occupancy_rate', 'mf', 93.8, '93.8%', 'operational'),
      ('total_rent_roll', 'total', 2847500, '$2,847,500', 'operational'),
      ('average_rent', 'total', 1898, '$1,898', 'operational'),
      ('average_rent', 'sfr', 2150, '$2,150', 'operational'),
      ('average_rent', 'mf', 1425, '$1,425', 'operational'),
      ('avg_occupancy_term', 'total', 18.5, '18.5 months', 'operational'),
      ('avg_occupancy_term', 'sfr', 21.2, '21.2 months', 'operational'),
      ('avg_occupancy_term', 'mf', 14.8, '14.8 months', 'operational'),
      ('early_terminations', 'total', 23, '23 residents', 'operational'),
      ('early_termination_rate', 'total', 1.5, '1.5%', 'operational'),
      ('month_to_month', 'total', 87, '87 residents', 'operational'),
      ('month_to_month_percent', 'total', 5.8, '5.8%', 'operational'),
      ('avg_owner_length', 'total', 4.2, '4.2 years', 'operational'),
      ('avg_owner_length', 'sfr', 5.1, '5.1 years', 'operational'),
      ('avg_owner_length', 'mf', 2.8, '2.8 years', 'operational'),
      ('outside_owners', 'total', 342, '342', 'operational'),
      ('outside_owners', 'sfr', 298, '298', 'operational'),
      ('outside_owners', 'mf', 44, '44', 'operational'),
      ('avg_days_on_market', 'total', 12.3, '12.3 days', 'operational'),
      ('avg_days_on_market', 'sfr', 15.7, '15.7 days', 'operational'),
      ('avg_days_on_market', 'mf', 8.9, '8.9 days', 'operational'),
      ('google_reviews', 'total', 847, '847', 'operational'),
      ('google_reviews_rating', 'total', 4.3, '4.3/5.0', 'operational'),
      ('leases_signed_month', 'total', 34, '34', 'operational'),
      ('leases_signed_month', 'sfr', 18, '18', 'operational'),
      ('leases_signed_month', 'mf', 16, '16', 'operational'),
      ('monthly_revenue', 'total', 2950000, '$2,950,000', 'financial'),
      ('ytd_revenue', 'total', 21500000, '$21,500,000', 'financial'),
      ('yoy_growth', 'total', 12.5, '12.5%', 'financial'),
      ('ebitda', 'total', 1180000, '$1,180,000', 'financial'),
      ('ebitda_margin', 'total', 40, '40%', 'financial'),
      ('cash_operating', 'total', 850000, '$850,000', 'financial'),
      ('company_value', 'total', 85000000, '$85,000,000', 'financial'),
      ('time_to_revenue', 'total', 45, '45 days', 'sales'),
      ('customer_ltv_sfr', 'sfr', 25800, '$25,800', 'sales'),
      ('customer_ltv_mf', 'mf', 17100, '$17,100', 'sales'),
      ('customer_acquisition_cost', 'sfr', 450, '$450', 'sales'),
      ('closing_ratio', 'total', 68, '68%', 'sales'),
      ('marketing_spend_total', 'total', 0, '$0', 'marketing'),
      ('marketing_spend_google', 'total', 0, '$0', 'marketing'),
      ('marketing_spend_facebook', 'total', 0, '$0', 'marketing'),
      ('cost_per_click', 'total', 0, '$0.00', 'marketing');
    `;

    const vacancyInsertSQL = `
      INSERT INTO vacancy_distribution (property_type, days_range, count) VALUES 
      ('total', 'lessThan7', 8),
      ('total', 'days8to14', 12),
      ('total', 'days15to30', 15),
      ('total', 'days30to45', 7),
      ('total', 'moreThan45', 3),
      ('sfr', 'lessThan7', 5),
      ('sfr', 'days8to14', 8),
      ('sfr', 'days15to30', 10),
      ('sfr', 'days30to45', 4),
      ('sfr', 'moreThan45', 2),
      ('mf', 'lessThan7', 3),
      ('mf', 'days8to14', 4),
      ('mf', 'days15to30', 5),
      ('mf', 'days30to45', 3),
      ('mf', 'moreThan45', 1);
    `;

    // Use the supabase-js client with RPC to execute as superuser
    const { error: metricsError } = await supabase.rpc('exec_sql', { sql: metricsInsertSQL });
    if (metricsError) {
      console.error('Error inserting metrics:', metricsError);
    } else {
      console.log('✓ Metrics inserted successfully');
    }

    const { error: vacancyError } = await supabase.rpc('exec_sql', { sql: vacancyInsertSQL });
    if (vacancyError) {
      console.error('Error inserting vacancy distribution:', vacancyError);
    } else {
      console.log('✓ Vacancy distribution data inserted successfully');
    }

    console.log('Data seeding complete!');

  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedDataWithRLSDisabled().catch(console.error);