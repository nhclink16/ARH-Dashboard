import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log('Starting data seeding...');

  // Metrics data
  const metricsData = [
    // Operational metrics
    { metric_type: 'occupancy_rate', property_type: 'total', value: 94.2, string_value: '94.2%', category: 'operational' },
    { metric_type: 'occupancy_rate', property_type: 'sfr', value: 95.1, string_value: '95.1%', category: 'operational' },
    { metric_type: 'occupancy_rate', property_type: 'mf', value: 93.8, string_value: '93.8%', category: 'operational' },
    { metric_type: 'total_rent_roll', property_type: 'total', value: 2847500, string_value: '$2,847,500', category: 'operational' },
    { metric_type: 'average_rent', property_type: 'total', value: 1898, string_value: '$1,898', category: 'operational' },
    { metric_type: 'average_rent', property_type: 'sfr', value: 2150, string_value: '$2,150', category: 'operational' },
    { metric_type: 'average_rent', property_type: 'mf', value: 1425, string_value: '$1,425', category: 'operational' },
    { metric_type: 'avg_occupancy_term', property_type: 'total', value: 18.5, string_value: '18.5 months', category: 'operational' },
    { metric_type: 'avg_occupancy_term', property_type: 'sfr', value: 21.2, string_value: '21.2 months', category: 'operational' },
    { metric_type: 'avg_occupancy_term', property_type: 'mf', value: 14.8, string_value: '14.8 months', category: 'operational' },
    { metric_type: 'early_terminations', property_type: 'total', value: 23, string_value: '23 residents', category: 'operational' },
    { metric_type: 'early_termination_rate', property_type: 'total', value: 1.5, string_value: '1.5%', category: 'operational' },
    { metric_type: 'month_to_month', property_type: 'total', value: 87, string_value: '87 residents', category: 'operational' },
    { metric_type: 'month_to_month_percent', property_type: 'total', value: 5.8, string_value: '5.8%', category: 'operational' },
    { metric_type: 'avg_owner_length', property_type: 'total', value: 4.2, string_value: '4.2 years', category: 'operational' },
    { metric_type: 'avg_owner_length', property_type: 'sfr', value: 5.1, string_value: '5.1 years', category: 'operational' },
    { metric_type: 'avg_owner_length', property_type: 'mf', value: 2.8, string_value: '2.8 years', category: 'operational' },
    { metric_type: 'outside_owners', property_type: 'total', value: 342, string_value: '342', category: 'operational' },
    { metric_type: 'outside_owners', property_type: 'sfr', value: 298, string_value: '298', category: 'operational' },
    { metric_type: 'outside_owners', property_type: 'mf', value: 44, string_value: '44', category: 'operational' },
    { metric_type: 'avg_days_on_market', property_type: 'total', value: 12.3, string_value: '12.3 days', category: 'operational' },
    { metric_type: 'avg_days_on_market', property_type: 'sfr', value: 15.7, string_value: '15.7 days', category: 'operational' },
    { metric_type: 'avg_days_on_market', property_type: 'mf', value: 8.9, string_value: '8.9 days', category: 'operational' },
    { metric_type: 'google_reviews', property_type: 'total', value: 847, string_value: '847', category: 'operational' },
    { metric_type: 'google_reviews_rating', property_type: 'total', value: 4.3, string_value: '4.3/5.0', category: 'operational' },
    { metric_type: 'leases_signed_month', property_type: 'total', value: 34, string_value: '34', category: 'operational' },
    { metric_type: 'leases_signed_month', property_type: 'sfr', value: 18, string_value: '18', category: 'operational' },
    { metric_type: 'leases_signed_month', property_type: 'mf', value: 16, string_value: '16', category: 'operational' },

    // Financial metrics
    { metric_type: 'monthly_revenue', property_type: 'total', value: 2950000, string_value: '$2,950,000', category: 'financial' },
    { metric_type: 'ytd_revenue', property_type: 'total', value: 21500000, string_value: '$21,500,000', category: 'financial' },
    { metric_type: 'yoy_growth', property_type: 'total', value: 12.5, string_value: '12.5%', category: 'financial' },
    { metric_type: 'ebitda', property_type: 'total', value: 1180000, string_value: '$1,180,000', category: 'financial' },
    { metric_type: 'ebitda_margin', property_type: 'total', value: 40, string_value: '40%', category: 'financial' },
    { metric_type: 'cash_operating', property_type: 'total', value: 850000, string_value: '$850,000', category: 'financial' },
    { metric_type: 'company_value', property_type: 'total', value: 85000000, string_value: '$85,000,000', category: 'financial' },

    // Sales metrics
    { metric_type: 'time_to_revenue', property_type: 'total', value: 45, string_value: '45 days', category: 'sales' },
    { metric_type: 'customer_ltv_sfr', property_type: 'sfr', value: 25800, string_value: '$25,800', category: 'sales' },
    { metric_type: 'customer_ltv_mf', property_type: 'mf', value: 17100, string_value: '$17,100', category: 'sales' },
    { metric_type: 'customer_acquisition_cost', property_type: 'sfr', value: 450, string_value: '$450', category: 'sales' },
    { metric_type: 'closing_ratio', property_type: 'total', value: 68, string_value: '68%', category: 'sales' },

    // Marketing metrics (all zeros as requested)
    { metric_type: 'marketing_spend_total', property_type: 'total', value: 0, string_value: '$0', category: 'marketing' },
    { metric_type: 'marketing_spend_google', property_type: 'total', value: 0, string_value: '$0', category: 'marketing' },
    { metric_type: 'marketing_spend_facebook', property_type: 'total', value: 0, string_value: '$0', category: 'marketing' },
    { metric_type: 'cost_per_click', property_type: 'total', value: 0, string_value: '$0.00', category: 'marketing' },
  ];

  // Insert metrics
  console.log(`Inserting ${metricsData.length} metrics...`);
  const { data: metrics, error: metricsError } = await supabase
    .from('metrics')
    .insert(metricsData);

  if (metricsError) {
    console.error('Error inserting metrics:', metricsError);
  } else {
    console.log('✓ Metrics inserted successfully');
  }

  // Vacancy distribution data
  const vacancyData = [
    { property_type: 'total', days_range: 'lessThan7', count: 8 },
    { property_type: 'total', days_range: 'days8to14', count: 12 },
    { property_type: 'total', days_range: 'days15to30', count: 15 },
    { property_type: 'total', days_range: 'days30to45', count: 7 },
    { property_type: 'total', days_range: 'moreThan45', count: 3 },
    { property_type: 'sfr', days_range: 'lessThan7', count: 5 },
    { property_type: 'sfr', days_range: 'days8to14', count: 8 },
    { property_type: 'sfr', days_range: 'days15to30', count: 10 },
    { property_type: 'sfr', days_range: 'days30to45', count: 4 },
    { property_type: 'sfr', days_range: 'moreThan45', count: 2 },
    { property_type: 'mf', days_range: 'lessThan7', count: 3 },
    { property_type: 'mf', days_range: 'days8to14', count: 4 },
    { property_type: 'mf', days_range: 'days15to30', count: 5 },
    { property_type: 'mf', days_range: 'days30to45', count: 3 },
    { property_type: 'mf', days_range: 'moreThan45', count: 1 },
  ];

  // Insert vacancy distribution
  console.log(`Inserting ${vacancyData.length} vacancy distribution records...`);
  const { data: vacancy, error: vacancyError } = await supabase
    .from('vacancy_distribution')
    .insert(vacancyData);

  if (vacancyError) {
    console.error('Error inserting vacancy distribution:', vacancyError);
  } else {
    console.log('✓ Vacancy distribution data inserted successfully');
  }

  console.log('Data seeding complete!');
}

seedData().catch(console.error);