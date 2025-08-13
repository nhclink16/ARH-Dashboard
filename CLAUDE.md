# Augusta Metrics Dashboard - Project Memory

## Current Status
- **Main Issue**: Dashboard showing incorrect data (866 of 1000 units vs 1251 of 1478 units)
- **Root Cause**: Invalid/expired Supabase API keys preventing database access
- **Architecture**: React frontend + Express API + Supabase database + Buildium API integration

## Project Structure
```
/client/src/pages/operational-dashboard.tsx - Main operational dashboard
/server/rent-roll-queries.ts - Database query logic for operational metrics  
/server/index.ts - Express server with API routes
/api/index.ts - Vercel API deployment routes
```

## Operational Dashboard Requirements (Jaron's List)
### ✅ Implemented (but not functional due to DB access)
1. Occupancy Percentage (SFR, MF, Total)
2. Total Rent Roll  
3. Average Rent (SFR, MF, Total)
4. Vacancy Distribution chart (0-14, 15-30, 31-60, 61-90, 90+ days)

### ⚠️ Partially Implemented  
5. Average term of occupancy (SFR, MF, Total) - basic logic exists
6. Month to month residents - estimated calculations
7. Average Days on Market - hardcoded estimate
8. Leases signed this month - basic query exists

### ❌ Not Implemented
9. How many people vacate lease within 6 months - needs lease termination data
10. Average length of owners (SFR, 3rd party MF) - needs owner history data
11. Total Number of Outside Owners - needs owner classification data  
12. Total Google Reviews - needs Google Places API integration

## Key Technical Issues
1. **Supabase Authentication**: Keys in supabase-mcp-config.json are invalid
2. **Data Sources**: rent_roll table exists but may have stale data
3. **Missing Data**: Need owner data, lease termination history, Google reviews
4. **Port Conflicts**: Server binding issues on macOS (AirPlay uses port 5000)

## Data Sources Available
- `rent_roll` table: Current unit/tenant data
- `metrics` table: Updated summary metrics (but not used by API)
- Buildium API: Real-time property management data (credentials available)
- Need to add: Owner data, historical lease data, Google reviews

## Environment Variables Needed
```
SUPABASE_URL=https://zkkxcqdkctueopixutsf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[VALID_KEY_NEEDED]
BUILDIUM_CLIENT_ID=2f088123-7525-4c95-8c41-30edb9a1da51
BUILDIUM_API_KEY=jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=
```

## Architecture Notes
- Frontend queries `/api/metrics/operational/database` endpoint
- Server uses RentRollQueries class for all database operations
- Property classification: SF = 1 unit per property, MF = multiple units per property
- Period selector supports YTD/Month/YoY comparisons (implemented)
- Vacancy chart shows 5 ranges as requested (implemented)

## Deployment
- Client: Vercel static hosting 
- API: Vercel serverless functions via /api routes
- Database: Supabase hosted PostgreSQL
- Last deployment: Shows old data due to DB access issues

## Priority Actions Needed
1. Fix Supabase authentication to restore database access
2. Implement missing metrics that require additional data sources
3. Add Google Places API for review data
4. Create owner data collection strategy
5. Implement lease termination tracking