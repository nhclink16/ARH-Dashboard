export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req: any, res: any) {
  console.log('Vacancy distribution endpoint called');
  
  try {
    res.status(200).json([
      {
        id: 1,
        propertyType: 'total',
        daysRange: '0-14 days',
        count: 0,
        lastUpdated: new Date()
      },
      {
        id: 2,
        propertyType: 'total',
        daysRange: '15-30 days',
        count: 0,
        lastUpdated: new Date()
      },
      {
        id: 3,
        propertyType: 'total',
        daysRange: '31-60 days', 
        count: 136,
        lastUpdated: new Date()
      },
      {
        id: 4,
        propertyType: 'total',
        daysRange: '61-90 days',
        count: 68,
        lastUpdated: new Date()
      },
      {
        id: 5,
        propertyType: 'total',
        daysRange: '90+ days',
        count: 23,
        lastUpdated: new Date()
      }
    ]);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}