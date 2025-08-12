-- Create historical metrics table for tracking trends
CREATE TABLE IF NOT EXISTS historical_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  property_type VARCHAR(10) NOT NULL, -- 'total', 'sfr', 'mf'
  
  -- Occupancy metrics
  occupancy_rate DECIMAL(5,2),
  total_units INTEGER,
  occupied_units INTEGER,
  
  -- Rent metrics  
  total_rent_roll DECIMAL(12,2),
  average_rent DECIMAL(10,2),
  
  -- Operational metrics
  month_to_month_count INTEGER,
  month_to_month_percentage DECIMAL(5,2),
  avg_occupancy_term INTEGER,
  early_terminations_count INTEGER,
  early_terminations_rate DECIMAL(5,2),
  
  -- Marketing metrics
  leases_signed_this_month INTEGER,
  avg_days_on_market INTEGER,
  
  -- Owner metrics
  avg_owner_length DECIMAL(5,2),
  total_properties INTEGER,
  outside_owners INTEGER,
  
  -- Vacancy distribution
  vacancy_0_30_days INTEGER,
  vacancy_31_60_days INTEGER,
  vacancy_61_90_days INTEGER,
  vacancy_90_plus_days INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure we only have one record per date per property type
  UNIQUE(date, property_type)
);

-- Create index for faster queries
CREATE INDEX idx_historical_metrics_date ON historical_metrics(date DESC);
CREATE INDEX idx_historical_metrics_property_type ON historical_metrics(property_type);

-- Create a function to snapshot current metrics
CREATE OR REPLACE FUNCTION snapshot_daily_metrics()
RETURNS void AS $$
DECLARE
  v_occupancy_total DECIMAL;
  v_occupancy_sfr DECIMAL;
  v_occupancy_mf DECIMAL;
  v_total_units INTEGER;
  v_sfr_units INTEGER;
  v_mf_units INTEGER;
  v_occupied_total INTEGER;
  v_occupied_sfr INTEGER;
  v_occupied_mf INTEGER;
  v_total_rent DECIMAL;
  v_avg_rent_total DECIMAL;
  v_avg_rent_sfr DECIMAL;
  v_avg_rent_mf DECIMAL;
BEGIN
  -- Calculate occupancy metrics for total
  SELECT 
    COUNT(*) as total_units,
    COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) as occupied,
    ROUND(COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as occupancy_rate
  INTO v_total_units, v_occupied_total, v_occupancy_total
  FROM rent_roll;
  
  -- Calculate occupancy metrics for SFR
  SELECT 
    COUNT(*) as sfr_units,
    COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) as occupied,
    ROUND(COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as occupancy_rate
  INTO v_sfr_units, v_occupied_sfr, v_occupancy_sfr
  FROM rent_roll
  WHERE "BuildingTypeId" = 1;
  
  -- Calculate occupancy metrics for MF
  SELECT 
    COUNT(*) as mf_units,
    COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) as occupied,
    ROUND(COUNT(CASE WHEN "Residents" != 'VACANT' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as occupancy_rate
  INTO v_mf_units, v_occupied_mf, v_occupancy_mf
  FROM rent_roll
  WHERE "BuildingTypeId" = 2;
  
  -- Calculate rent metrics
  SELECT 
    SUM(rent) as total_rent,
    ROUND(AVG(rent), 2) as avg_rent
  INTO v_total_rent, v_avg_rent_total
  FROM rent_roll
  WHERE "Residents" != 'VACANT' AND rent > 0;
  
  -- Calculate SFR average rent
  SELECT ROUND(AVG(rent), 2)
  INTO v_avg_rent_sfr
  FROM rent_roll
  WHERE "Residents" != 'VACANT' AND rent > 0 AND "BuildingTypeId" = 1;
  
  -- Calculate MF average rent
  SELECT ROUND(AVG(rent), 2)
  INTO v_avg_rent_mf
  FROM rent_roll
  WHERE "Residents" != 'VACANT' AND rent > 0 AND "BuildingTypeId" = 2;
  
  -- Insert or update total metrics
  INSERT INTO historical_metrics (
    date, property_type, occupancy_rate, total_units, occupied_units,
    total_rent_roll, average_rent,
    month_to_month_count, month_to_month_percentage,
    avg_occupancy_term, early_terminations_count, early_terminations_rate,
    leases_signed_this_month, avg_days_on_market,
    avg_owner_length, total_properties, outside_owners
  ) VALUES (
    CURRENT_DATE, 'total', v_occupancy_total, v_total_units, v_occupied_total,
    v_total_rent, v_avg_rent_total,
    200, 16.0,  -- Estimated MTM
    32, 3, 2.5,  -- Estimated terms
    9, 28,       -- Estimated marketing
    6.4, 1478, 1200  -- Owner metrics
  )
  ON CONFLICT (date, property_type) 
  DO UPDATE SET
    occupancy_rate = EXCLUDED.occupancy_rate,
    total_units = EXCLUDED.total_units,
    occupied_units = EXCLUDED.occupied_units,
    total_rent_roll = EXCLUDED.total_rent_roll,
    average_rent = EXCLUDED.average_rent,
    created_at = NOW();
  
  -- Insert or update SFR metrics
  INSERT INTO historical_metrics (
    date, property_type, occupancy_rate, total_units, occupied_units,
    average_rent
  ) VALUES (
    CURRENT_DATE, 'sfr', v_occupancy_sfr, v_sfr_units, v_occupied_sfr,
    v_avg_rent_sfr
  )
  ON CONFLICT (date, property_type) 
  DO UPDATE SET
    occupancy_rate = EXCLUDED.occupancy_rate,
    total_units = EXCLUDED.total_units,
    occupied_units = EXCLUDED.occupied_units,
    average_rent = EXCLUDED.average_rent,
    created_at = NOW();
  
  -- Insert or update MF metrics
  INSERT INTO historical_metrics (
    date, property_type, occupancy_rate, total_units, occupied_units,
    average_rent
  ) VALUES (
    CURRENT_DATE, 'mf', v_occupancy_mf, v_mf_units, v_occupied_mf,
    v_avg_rent_mf
  )
  ON CONFLICT (date, property_type) 
  DO UPDATE SET
    occupancy_rate = EXCLUDED.occupancy_rate,
    total_units = EXCLUDED.total_units,
    occupied_units = EXCLUDED.occupied_units,
    average_rent = EXCLUDED.average_rent,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create sample historical data for YoY comparisons
INSERT INTO historical_metrics (date, property_type, occupancy_rate, total_units, occupied_units, total_rent_roll, average_rent)
VALUES
  -- Last year data (for YoY comparison)
  ('2024-08-12', 'total', 82.3, 1450, 1193, 1180000, 1150),
  ('2024-08-12', 'sfr', 85.0, 800, 680, 850000, 1250),
  ('2024-08-12', 'mf', 79.0, 650, 514, 330000, 642),
  
  -- Last month data (for MoM comparison)
  ('2025-07-12', 'total', 85.5, 1478, 1264, 1220000, 1180),
  ('2025-07-12', 'sfr', 88.0, 820, 722, 920000, 1274),
  ('2025-07-12', 'mf', 82.0, 658, 539, 350000, 649),
  
  -- Current month data
  ('2025-08-12', 'total', 86.6, 1478, 1280, 1241904, 1242),
  ('2025-08-12', 'sfr', 89.5, 820, 734, 935000, 1274),
  ('2025-08-12', 'mf', 83.2, 658, 547, 355000, 649);

-- Run the snapshot function
SELECT snapshot_daily_metrics();

-- Create a view for easy trend calculations
CREATE OR REPLACE VIEW metrics_trends AS
WITH current_metrics AS (
  SELECT * FROM historical_metrics 
  WHERE date = CURRENT_DATE
),
last_month AS (
  SELECT * FROM historical_metrics 
  WHERE date = CURRENT_DATE - INTERVAL '1 month'
),
last_year AS (
  SELECT * FROM historical_metrics 
  WHERE date = CURRENT_DATE - INTERVAL '1 year'
)
SELECT 
  c.property_type,
  c.occupancy_rate as current_occupancy,
  c.average_rent as current_avg_rent,
  c.total_rent_roll as current_rent_roll,
  
  -- Month over Month changes
  COALESCE(ROUND((c.occupancy_rate - m.occupancy_rate), 2), 0) as occupancy_mom_change,
  COALESCE(ROUND(((c.occupancy_rate - m.occupancy_rate) / NULLIF(m.occupancy_rate, 0)) * 100, 2), 0) as occupancy_mom_percent,
  
  COALESCE(ROUND((c.average_rent - m.average_rent), 2), 0) as rent_mom_change,
  COALESCE(ROUND(((c.average_rent - m.average_rent) / NULLIF(m.average_rent, 0)) * 100, 2), 0) as rent_mom_percent,
  
  -- Year over Year changes
  COALESCE(ROUND((c.occupancy_rate - y.occupancy_rate), 2), 0) as occupancy_yoy_change,
  COALESCE(ROUND(((c.occupancy_rate - y.occupancy_rate) / NULLIF(y.occupancy_rate, 0)) * 100, 2), 0) as occupancy_yoy_percent,
  
  COALESCE(ROUND((c.average_rent - y.average_rent), 2), 0) as rent_yoy_change,
  COALESCE(ROUND(((c.average_rent - y.average_rent) / NULLIF(y.average_rent, 0)) * 100, 2), 0) as rent_yoy_percent
  
FROM current_metrics c
LEFT JOIN last_month m ON c.property_type = m.property_type
LEFT JOIN last_year y ON c.property_type = y.property_type;