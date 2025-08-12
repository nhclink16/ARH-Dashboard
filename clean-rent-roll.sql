-- Clean up rent_roll table by removing properties ending management
-- Run this in your Supabase SQL Editor

-- First, let's see what we're removing (68 units total)
SELECT 
  COUNT(*) as units_to_remove,
  STRING_AGG(DISTINCT SUBSTRING("PropertyName" FROM '^[^(]*'), ', ') as properties_ending
FROM rent_roll 
WHERE "PropertyName" LIKE '(Last Day%';

-- Delete all units where management is ending
-- This includes all variations: (Last Day MGT...), (Last Day of MGMT...), etc.
DELETE FROM rent_roll 
WHERE "PropertyName" LIKE '(Last Day%';

-- Verify the cleanup
SELECT 
  COUNT(*) as total_units_remaining,
  COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) as occupied_units,
  COUNT(CASE WHEN "Residents" = 'VACANT' THEN 1 END) as vacant_units,
  ROUND(COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 1) as occupancy_rate
FROM rent_roll;

-- Show summary of active portfolio
SELECT 
  COUNT(*) as total_units,
  COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) as occupied,
  SUM(CASE WHEN "Residents" != 'VACANT' THEN "rent" ELSE 0 END) as total_rent_roll,
  ROUND(AVG(CASE WHEN "Residents" != 'VACANT' AND "rent" > 0 THEN "rent" END), 0) as avg_rent
FROM rent_roll;