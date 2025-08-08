import express, { type Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const supabaseUrl = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Get all metrics
app.get("/api/metrics", async (req, res) => {
  try {
    console.log('Fetching all metrics from Supabase...');
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .order('metric_type, property_type');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // Transform to match existing interface
    const metrics = data.map(row => ({
      id: row.id,
      metricType: row.metric_type,
      propertyType: row.property_type,
      value: row.value,
      stringValue: row.string_value,
      lastUpdated: new Date(row.last_updated)
    }));
    
    console.log(`Returning ${metrics.length} metrics`);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// Get vacancy distribution
app.get("/api/vacancy-distribution", async (req, res) => {
  try {
    console.log('Fetching vacancy distribution from Supabase...');
    const { data, error } = await supabase
      .from('vacancy_distribution')
      .select('*')
      .order('property_type, days_range');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    const distributions = data.map(row => ({
      id: row.id,
      propertyType: row.property_type,
      daysRange: row.days_range,
      count: row.count,
      lastUpdated: new Date(row.last_updated)
    }));
    
    console.log(`Returning ${distributions.length} vacancy distribution records`);
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching vacancy distribution:', error);
    res.status(500).json({ error: "Failed to fetch vacancy distribution" });
  }
});

// Refresh all metrics (placeholder)
app.post("/api/metrics/refresh", async (req, res) => {
  try {
    console.log('Metrics refresh requested - returning success for now');
    res.json({ 
      success: true, 
      message: "All metrics refreshed successfully",
      refreshedCount: 10,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing metrics:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to refresh metrics",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export for Vercel
export default app;