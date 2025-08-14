export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req: any, res: any) {
  console.log('Historical endpoint called');
  
  try {
    const trends = {
      occupancy: {
        ytd: 82.1,
        lastMonth: 83.8,
        lastYear: 81.5
      },
      avgRent: {
        ytd: 1150,
        lastMonth: 1190,
        lastYear: 1140
      },
      rentRoll: {
        ytd: 1350000,
        lastMonth: 1420000,
        lastYear: 1320000
      },
      daysOnMarket: {
        ytd: 38,
        lastMonth: 34,
        lastYear: 42
      },
      monthToMonth: {
        ytd: 3.3,
        lastMonth: 2.9,
        lastYear: 3.5
      },
      terminations: {
        ytd: 2.8,
        lastMonth: 2.3,
        lastYear: 3.1
      },
      avgTerm: {
        ytd: 30,
        lastMonth: 33,
        lastYear: 29
      },
      newLeases: {
        ytd: 8,
        lastMonth: 12,
        lastYear: 7
      }
    };
    
    res.status(200).json(trends);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}