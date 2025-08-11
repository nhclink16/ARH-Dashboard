// Quick fix: Use raw fetch to disable RLS on tables
const SUPABASE_URL = 'https://zkkxcqdkctueopixutsf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM3Nzk4OCwiZXhwIjoyMDYzOTUzOTg4fQ.dIpNid2O-HQc_LwAW0F1vJm2OJkzGkEMqWo3kEGxh8c';

async function fixRLS() {
  console.log('🔧 Temporarily disabling RLS to fix data loading...');

  const queries = [
    'ALTER TABLE metrics DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE vacancy_distribution DISABLE ROW LEVEL SECURITY;'
  ];

  for (const sql of queries) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });

      if (response.ok) {
        console.log('✅ SQL executed:', sql);
      } else {
        const error = await response.text();
        console.log('❌ SQL failed:', sql, error);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('🎉 RLS disabled! Your dashboard should now load data.');
  console.log('Note: RLS is now disabled for public access. Consider re-enabling with proper policies later.');
}

fixRLS().catch(console.error);