// SECURE version - uses environment variables
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Use environment variables - NEVER hardcode keys!
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Set this in .env

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Rest of your import code...
console.log('✅ Using secure environment variables for API keys');