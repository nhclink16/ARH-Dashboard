# Buildium API Metrics Implementation Analysis

## Available Buildium Endpoints (Confirmed Working)
✅ `/v1/rentals` - Properties (RentalSubType: SFR/MF classification)
✅ `/v1/rentals/units` - Units (IsOccupied, MarketRent, Rent fields)
✅ `/v1/leases` - Leases (Status, TermType, dates)
✅ `/v1/rentals/owners` - Property Owners (ManagementAgreementStartDate)
✅ `/v1/workorders` - Work Orders
✅ `/v1/tasks` - Tasks (50 records found)
✅ `/v1/vendors` - Vendors (50 records found)
✅ `/v1/files` - Files (50 records found)

## Operational Metrics Analysis & Implementation Plan

### 1. ✅ OCCUPANCY RATE (IMPLEMENTED)
**Status**: FULLY IMPLEMENTED ✅
- **Data Source**: `/v1/rentals/units` with `IsOccupied` field
- **Implementation**: Already working in `buildiumClient.calculateOccupancyRates()`
- **Formula**: `(Occupied Units / Total Units) * 100`
- **Property Types**: Total, SFR, MF (using `RentalSubType`)

### 2. ✅ AVERAGE RENT & TOTAL RENT ROLL (IMPLEMENTED) 
**Status**: FULLY IMPLEMENTED ✅
- **Data Source**: `/v1/rentals/units` with `MarketRent` field
- **Implementation**: Already working in `buildiumClient.calculateRentMetrics()`
- **Formula**: 
  - Average: `Sum of all rents / Number of units`
  - Total: `Sum of all rents`
- **Property Types**: Total, SFR, MF

### 3. 🟡 AVERAGE OCCUPANCY TERM
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/leases` - `LeaseFromDate`, `LeaseToDate`, `MoveInDate`, `MoveOutDate`
- **Implementation Strategy**:
  ```javascript
  // Filter active leases (LeaseStatus = "Active")
  // Calculate: (MoveOutDate || LeaseToDate) - MoveInDate
  // Average across all active leases
  ```
- **Formula**: `Average((End Date - Start Date) in months)` for active leases
- **Property Types**: Total, SFR, MF
- **Buildium Fields**: 
  - `LeaseStatus` (filter to "Active")
  - `MoveInDate` (start date)
  - `LeaseToDate` or `MoveOutDate` (end date)

### 4. 🟡 EARLY TERMINATIONS
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/leases` with date analysis
- **Implementation Strategy**:
  ```javascript
  // Find leases where MoveOutDate < LeaseToDate (early termination)
  // Filter by current month/timeframe
  // Count terminated leases vs total active leases
  ```
- **Formula**: 
  - Count: `Leases where MoveOutDate exists AND MoveOutDate < LeaseToDate`
  - Rate: `(Early Terminations / Total Active Leases) * 100`
- **Buildium Fields**:
  - `MoveOutDate` (actual move out)
  - `LeaseToDate` (planned end date)
  - `LeaseStatus`

### 5. 🟡 MONTH-TO-MONTH TENANTS
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/leases` - `TermType` field
- **Implementation Strategy**:
  ```javascript
  // Filter leases where TermType = "MonthToMonth" or similar
  // Count active month-to-month leases
  ```
- **Formula**: 
  - Count: `Leases where TermType = "MonthToMonth" AND LeaseStatus = "Active"`
  - Percentage: `(MTM Leases / Total Active Leases) * 100`
- **Buildium Fields**:
  - `TermType` (expected values: "MonthToMonth", "Fixed", etc.)
  - `LeaseStatus`

### 6. 🟡 AVERAGE OWNER LENGTH
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/rentals/owners` - `ManagementAgreementStartDate`
- **Implementation Strategy**:
  ```javascript
  // Calculate: Current Date - ManagementAgreementStartDate
  // Average across all owners
  ```
- **Formula**: `Average((Today - ManagementAgreementStartDate) in years)`
- **Property Types**: Total, SFR, MF
- **Buildium Fields**:
  - `ManagementAgreementStartDate`
  - Cross-reference with property `RentalSubType`

### 7. 🟡 OUTSIDE OWNERS (STATE CLASSIFICATION)
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/rentals/owners` - owner address information
- **Implementation Strategy**:
  ```javascript
  // Check owner address state vs property location state
  // Count owners where states don't match
  ```
- **Formula**: `Count of owners where owner.state != property.state`
- **Property Types**: Total, SFR, MF
- **Challenge**: Need to examine owner data structure for address fields

### 8. 🟡 AVERAGE DAYS ON MARKET
**Status**: NEEDS IMPLEMENTATION - COMPLEX 🔄
- **Data Source**: `/v1/leases` historical data or `/v1/rentals/units` vacancy tracking
- **Implementation Strategy**:
  ```javascript
  // Option 1: Calculate from lease gaps
  // Find gaps between MoveOutDate and next MoveInDate for same unit
  // 
  // Option 2: Track current vacancies
  // Units where IsOccupied = false, calculate days since last lease ended
  ```
- **Formula**: `Average(Next MoveIn Date - Previous MoveOut Date)`
- **Property Types**: Total, SFR, MF
- **Challenge**: Requires historical lease data or vacancy tracking

### 9. ❌ GOOGLE REVIEWS
**Status**: NOT AVAILABLE IN BUILDIUM ❌
- **Data Source**: External Google Places API
- **Implementation**: Requires separate Google Places API integration
- **Note**: This metric is external to property management data

### 10. 🟡 LEASES SIGNED (THIS MONTH)
**Status**: NEEDS IMPLEMENTATION 🔄
- **Data Source**: `/v1/leases` with date filtering
- **Implementation Strategy**:
  ```javascript
  // Filter leases by MoveInDate within current month
  // OR filter by lease creation date if available
  ```
- **Formula**: `Count of leases where MoveInDate is in current month`
- **Property Types**: Total, SFR, MF
- **Buildium Fields**:
  - `MoveInDate` (filter to current month)
  - `LeaseStatus` = "Active"

### 11. 🟡 VACANCY DURATION DISTRIBUTION CHART
**Status**: NEEDS IMPLEMENTATION - COMPLEX 🔄
- **Data Source**: Same as "Days on Market" - requires vacancy period calculation
- **Implementation Strategy**:
  ```javascript
  // Calculate vacancy periods for all units
  // Group into buckets: <7 days, 8-14 days, 15-30 days, 30-45 days, >45 days
  // Count occurrences in each bucket
  ```
- **Formula**: Group vacancy periods into predefined ranges
- **Property Types**: Total, SFR, MF

## Implementation Priority Order

### Phase 1: Simple Database Lookups (Ready to implement)
1. **Month-to-Month Tenants** - Direct `TermType` field lookup
2. **Average Owner Length** - Simple date calculation
3. **Leases Signed This Month** - Date filtering on existing data

### Phase 2: Moderate Complexity
4. **Average Occupancy Term** - Date calculations on active leases
5. **Early Terminations** - Compare actual vs planned end dates
6. **Outside Owners** - Address comparison (need to examine data structure)

### Phase 3: Complex Calculations
7. **Average Days on Market** - Requires vacancy period tracking
8. **Vacancy Duration Distribution** - Complex historical analysis

### Phase 4: External Integration
9. **Google Reviews** - Separate Google Places API integration

## Next Steps
1. Implement Phase 1 metrics (simple lookups)
2. Test each implementation with real Buildium data
3. Update storage methods in `supabase-storage.ts`
4. Verify calculations with sample data
5. Move to Phase 2 metrics

## Data Structure Notes
- All endpoints return 50 records by default (pagination available)
- Date filtering works with `CreatedDateTimeFrom` parameter
- Property classification via `RentalSubType` field
- Lease statuses and term types need examination of actual values
- Owner address structure needs investigation for state comparison