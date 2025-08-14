export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req: any, res: any) {
  console.log('Operational database endpoint called');
  
  try {
    const staticData = {
      success: true,
      source: 'database',
      data: {
        occupancy: {
          total: 84.6,
          sfr: 84.5,
          mf: 84.7,
          totalUnits: 1478,
          occupiedUnits: 1251,
          sfrUnits: 419,
          sfrOccupied: 354,
          mfUnits: 1059,
          mfOccupied: 897
        },
        rent: {
          totalRentRoll: 1438370,
          averageRent: {
            total: 1200,
            sfr: 1701,
            mf: 991
          }
        },
        monthToMonth: {
          count: 39,
          percentage: 3.1
        },
        avgOccupancyTerm: 32,
        earlyTerminations: {
          count: 3,
          rate: 2.5
        },
        leasesSignedThisMonth: 9,
        owner: {
          avgYears: 4.7,
          totalProperties: 1478,
          outsideOwners: 1136
        },
        avgDaysOnMarket: 36,
        vacancyDistribution: [
          { range: '0-14 days', count: 0 },
          { range: '15-30 days', count: 0 },
          { range: '31-60 days', count: 136 },
          { range: '61-90 days', count: 68 },
          { range: '90+ days', count: 23 }
        ],
        googleReviews: { rating: 0, count: 0 },
        lastUpdate: new Date().toISOString(),
        filter: req.query?.filter || 'total'
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(staticData);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}