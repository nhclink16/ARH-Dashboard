-- Create table for Rent Roll data
CREATE TABLE IF NOT EXISTS rent_roll (
  id SERIAL PRIMARY KEY,
  property_name VARCHAR(255),
  unit_number VARCHAR(50),
  square_footage INTEGER,
  bed_bath VARCHAR(50),
  residents TEXT, -- Will be 'VACANT' or tenant names
  lease_start_raw VARCHAR(50),
  lease_end_raw VARCHAR(50),
  lease_start DATE,
  lease_end DATE,
  market_rent DECIMAL(10,2),
  prepayments DECIMAL(10,2),
  lease_id VARCHAR(50),
  is_eviction_pending BOOLEAN,
  building_type_id INTEGER,
  rent DECIMAL(10,2),
  recurring_charges DECIMAL(10,2),
  recurring_credits DECIMAL(10,2),
  total DECIMAL(10,2),
  has_sub_items BOOLEAN,
  balance DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  -- Derived fields
  is_occupied BOOLEAN GENERATED ALWAYS AS (residents != 'VACANT') STORED,
  is_ending_management BOOLEAN GENERATED ALWAYS AS (property_name LIKE '(Last Day%') STORED,
  management_end_date DATE, -- We'll parse this from property_name
  property_type VARCHAR(10), -- 'SFR' or 'MF' based on building_type_id
  -- Metadata
  import_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_rent_roll_occupied ON rent_roll(is_occupied);
CREATE INDEX idx_rent_roll_property ON rent_roll(property_name);
CREATE INDEX idx_rent_roll_dates ON rent_roll(lease_start, lease_end);
CREATE INDEX idx_rent_roll_management ON rent_roll(is_ending_management);

-- Create view for active properties (excluding those ending management)
CREATE VIEW active_rent_roll AS
SELECT * 
FROM rent_roll 
WHERE is_ending_management = FALSE 
   OR management_end_date > CURRENT_DATE;