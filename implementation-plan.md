# Augusta Metrics Implementation Plan

## Phase 1: Database Setup (Immediate)

### Tables Needed:
```sql
-- Store unit snapshots for historical tracking
CREATE TABLE buildium_units_snapshot (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  unit_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  property_type VARCHAR(10), -- 'SFR' or 'MF'
  is_occupied BOOLEAN,
  market_rent DECIMAL(10,2),
  unit_size INTEGER,
  bedrooms VARCHAR(50),
  bathrooms VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store lease snapshots
CREATE TABLE buildium_leases_snapshot (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  lease_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  unit_id INTEGER,
  lease_status VARCHAR(50),
  term_type VARCHAR(50),
  lease_from_date DATE,
  lease_to_date DATE,
  move_in_date DATE,
  move_out_date DATE,
  rent_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store calculated metrics daily
CREATE TABLE buildium_metrics_history (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_name VARCHAR(100),
  property_type VARCHAR(10), -- 'total', 'sfr', 'mf'
  metric_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Phase 2: Data Import (What You Should Export)

### From Buildium Web Interface, Export These Reports:

1. **Rent Roll Report** (CRITICAL)
   - Export as: CSV
   - Frequency: Weekly or Monthly
   - Contains: Unit status, rent amounts, tenant info
   - Upload to: `buildium_units_snapshot`

2. **Active Lease Report** (CRITICAL)
   - Export as: CSV
   - Frequency: Weekly
   - Contains: All lease details, terms, dates
   - Upload to: `buildium_leases_snapshot`

3. **Owner Report** (IMPORTANT)
   - Export as: CSV
   - Frequency: Monthly
   - Contains: Owner details, management dates
   - Upload to: Separate owner table if needed

4. **Vacancy Report** (HELPFUL)
   - Export as: CSV
   - Frequency: Weekly
   - Contains: Vacant units, days vacant
   - Upload to: Use for days-on-market calculations

## Phase 3: Dashboard Updates

### Add Info Tooltips to Each Metric:

```typescript
// Example tooltip component
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Info className="h-4 w-4 text-gray-400" />
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-xs">
        <strong>Occupancy Rate</strong><br/>
        Formula: (Occupied Units / Total Units) × 100<br/>
        Source: Buildium units API<br/>
        Last updated: {lastUpdated}
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Calculation Documentation:

**Occupancy Rate:**
- Formula: `(Occupied Units / Total Units) × 100`
- SFR: Only SFR units
- MF: Only MF units

**Total Rent Roll:**
- Formula: `Sum of all MarketRent where IsUnitOccupied = true`

**Average Rent:**
- Formula: `Total Rent Roll / Count of Occupied Units with Rent > 0`

**Month-to-Month %:**
- Formula: `Count(TermType='MonthToMonth') / Count(Active Leases) × 100`

**Average Owner Length:**
- Formula: `AVG(Today - ManagementAgreementStartDate) in years`

**Outside Owners:**
- Definition: Owners with addresses outside property state
- Need owner address data from export

**Early Terminations:**
- Formula: `Count(MoveOutDate < LeaseToDate) / Total Completed Leases × 100`

**Leases Signed This Month:**
- Formula: `Count(LeaseSignedDate in current month)`

**Days on Market:**
- Formula: `AVG(NextLeaseStart - PreviousLeaseEnd) for each unit`
- Requires historical data

**Google Reviews:**
- External API required (not in Buildium)

## Phase 4: Automation Options

### Option A: Manual Upload (Easier)
1. Export reports from Buildium weekly/monthly
2. Upload CSVs to Supabase via simple upload interface
3. Run calculation scripts

### Option B: Semi-Automated (Better)
1. Create upload endpoint in API
2. You export and upload CSVs
3. System automatically processes and calculates metrics

### Option C: Fully Automated (Best, but complex)
1. Schedule daily API pulls (within rate limits)
2. Store snapshots automatically
3. Calculate trends over time

## Recommended Immediate Actions:

1. **Export these from Buildium NOW:**
   - Full Rent Roll Report (CSV)
   - Active Leases Report (CSV)
   - Owner Report (CSV)
   
2. **Tell me:**
   - Which reports you can actually export
   - What columns are in each report
   - How often you want to update (daily/weekly/monthly)

3. **I'll then:**
   - Create the database schema
   - Build import scripts
   - Add tooltips to dashboard
   - Implement historical tracking

## Questions for You:

1. Can you access Buildium's Reports section?
2. Which export formats are available (CSV, Excel, PDF)?
3. Do you want daily, weekly, or monthly snapshots?
4. Should we track seasonal trends (important for property management)?
5. Do you need audit trails for data changes?

## Data Size Estimates:

- 2,657 units × 365 days = ~970K records/year
- 4,081 leases × 12 months = ~49K records/year
- Supabase free tier: 500MB storage (plenty of room)

This approach will give you:
- Historical trending
- Data backup
- Calculation transparency
- Easy onboarding for Jaron or others
- Future-proof architecture