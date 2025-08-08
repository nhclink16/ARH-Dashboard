-- Create metrics table for storing all dashboard metrics
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  property_type TEXT NOT NULL, -- 'sfr', 'mf', 'total'
  value REAL NOT NULL,
  string_value TEXT,
  category TEXT, -- 'operational', 'sales', 'financial', 'marketing'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, property_type)
);

-- Create vacancy distribution table
CREATE TABLE IF NOT EXISTS vacancy_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type TEXT NOT NULL,
  days_range TEXT NOT NULL,
  count INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_type, days_range)
);

-- Create historical snapshots table for tracking metrics over time
CREATE TABLE IF NOT EXISTS metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  property_type TEXT NOT NULL,
  value REAL NOT NULL,
  string_value TEXT,
  category TEXT,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, property_type, snapshot_date)
);

-- Create API cache table
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS dashboard_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'viewer', -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_category ON metrics(category);
CREATE INDEX IF NOT EXISTS idx_metrics_updated ON metrics(last_updated);
CREATE INDEX IF NOT EXISTS idx_history_date ON metrics_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON api_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Allow authenticated read access to metrics" ON metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access to vacancy_distribution" ON vacancy_distribution
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access to metrics_history" ON metrics_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin policies for write access
CREATE POLICY "Allow admin write access to metrics" ON metrics
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM dashboard_users 
      WHERE dashboard_users.id = auth.uid() 
      AND dashboard_users.role = 'admin'
    )
  );

CREATE POLICY "Allow admin write access to vacancy_distribution" ON vacancy_distribution
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM dashboard_users 
      WHERE dashboard_users.id = auth.uid() 
      AND dashboard_users.role = 'admin'
    )
  );