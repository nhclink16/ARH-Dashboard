export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req: any, res: any) {
  console.log('Basic metrics endpoint called');
  
  try {
    res.status(200).json([]);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}