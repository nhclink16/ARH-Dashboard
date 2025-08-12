-- Drop the old table if it exists
DROP TABLE IF EXISTS rent_roll;

-- Create table with column names that EXACTLY match the CSV headers
CREATE TABLE rent_roll (
  id SERIAL PRIMARY KEY,
  "PropertyName" VARCHAR(255),
  "number" VARCHAR(50),
  "squareFootage" INTEGER,
  "BedBath" VARCHAR(50),
  "Residents" TEXT,
  "LeaseStartRaw" VARCHAR(50),
  "LeaseEndRaw" VARCHAR(50),
  "Start" VARCHAR(50),
  "End" VARCHAR(50),
  "MarketRent" DECIMAL(10,2),
  "Prepayments" DECIMAL(10,2),
  "leaseId" VARCHAR(50),
  "isEvictionPending" INTEGER,
  "BuildingTypeId" INTEGER,
  "rent" DECIMAL(10,2),
  "recurringCharges" DECIMAL(10,2),
  "recurringCredits" DECIMAL(10,2),
  "total" DECIMAL(10,2),
  "hasSubItems" VARCHAR(50),
  "balance" DECIMAL(10,2),
  "SecurityDeposit" DECIMAL(10,2),
  -- Add our computed columns
  is_occupied BOOLEAN GENERATED ALWAYS AS ("Residents" != 'VACANT') STORED,
  is_ending_management BOOLEAN GENERATED ALWAYS AS ("PropertyName" LIKE '(Last Day%') STORED,
  import_date TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_rent_roll_occupied ON rent_roll(is_occupied);
CREATE INDEX idx_rent_roll_property ON rent_roll("PropertyName");
CREATE INDEX idx_rent_roll_residents ON rent_roll("Residents");