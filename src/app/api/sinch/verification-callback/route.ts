import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Sinch verification callback:', JSON.stringify(body));

    // Allow all verification requests
    return Response.json({ action: 'allow' });
  } catch (err) {
    console.error('Sinch callback error:', err);
    return Response.json({ action: 'allow' });
  }
}
