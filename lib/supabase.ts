import { createClient } from '@supabase/supabase-js';

// These will be replaced with environment variables in production
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Metric {
  id: string;
  metric_type: string;
  property_type: string;
  value: number;
  string_value?: string;
  category?: string;
  last_updated: string;
  created_at: string;
}

export interface VacancyDistribution {
  id: string;
  property_type: string;
  days_range: string;
  count: number;
  last_updated: string;
  created_at: string;
}

export interface MetricsHistory {
  id: string;
  metric_type: string;
  property_type: string;
  value: number;
  string_value?: string;
  category?: string;
  snapshot_date: string;
  created_at: string;
}

export interface DashboardUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  last_login?: string;
}