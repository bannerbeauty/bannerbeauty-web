import type { NextRequest } from 'next/server';

const STRIPE_SK = process.env.STRIPE_SECRET_KEY!;

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return Response.json({ error: 'No session ID' }, { status: 400 });

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SK}` },
    });
    const session = await res.json();

    return Response.json({
      subscriptionId: session.subscription ?? '',
      isRecurring: session.mode === 'subscription',
      amount: (session.amount_total ?? 0) / 100,
    });
  } catch (err) {
    console.error('Session fetch error:', err);
    return Response.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
