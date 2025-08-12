-- Set up daily cron job for metrics refresh
-- This uses pg_cron extension to schedule the Edge Function

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the daily metrics refresh Edge Function
-- Runs every day at 2:00 AM EST (7:00 AM UTC)
SELECT cron.schedule(
  'daily-metrics-refresh',  -- Job name
  '0 7 * * *',              -- Cron expression (daily at 7 AM UTC)
  $$
    SELECT
      net.http_post(
        url := 'https://zkkxcqdkctueopixutsf.supabase.co/functions/v1/daily-metrics-refresh',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object('scheduled', true)
      ) AS request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('daily-metrics-refresh');

-- Alternative: Use Supabase's built-in scheduling
-- You can also schedule this through Supabase Dashboard:
-- 1. Go to Database > Extensions
-- 2. Enable pg_cron
-- 3. Go to SQL Editor
-- 4. Run this script

-- For testing the function manually:
-- You can trigger it via HTTP POST to:
-- https://zkkxcqdkctueopixutsf.supabase.co/functions/v1/daily-metrics-refresh