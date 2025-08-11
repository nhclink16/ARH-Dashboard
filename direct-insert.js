// Simple direct insert using fetch with service role key
const SUPABASE_URL = 'https://zkkxcqdkctueopixutsf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

// Using raw SQL with the REST API
async function insertData() {
  console.log('Trying direct SQL insert...');

  const insertSQL = `
    INSERT INTO metrics (metric_type, property_type, value, string_value, category) VALUES 
    ('occupancy_rate', 'total', 94.2, '94.2%', 'operational'),
    ('occupancy_rate', 'sfr', 95.1, '95.1%', 'operational'),
    ('occupancy_rate', 'mf', 93.8, '93.8%', 'operational')
    ON CONFLICT DO NOTHING;
  `;

  try {
    const response = await fetch(\`\${SUPABASE_URL}/rest/v1/rpc/exec_sql\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${SERVICE_KEY}\`,
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ sql: insertSQL })
    });

    const result = await response.text();
    console.log('Result:', result);

  } catch (error) {
    console.error('Error:', error);
  }
}

insertData();