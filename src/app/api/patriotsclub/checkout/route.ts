import type { NextRequest } from 'next/server';

const STRIPE_SK = process.env.STRIPE_SECRET_KEY!;
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://www.bannerbeauty.com';

export async function POST(req: NextRequest) {
  try {
    const { neighborId, priceId, isRecurring } = await req.json();

    const params = new URLSearchParams();
    params.append('mode', isRecurring ? 'subscription' : 'payment');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${BASE_URL}/patriots-club/success?session_id={CHECKOUT_SESSION_ID}&neighborId=${neighborId}`);
    params.append('cancel_url', `${BASE_URL}/patriots-club`);
    params.append('metadata[neighborId]', neighborId ?? '');
    params.append('metadata[isRecurring]', isRecurring ? 'true' : 'false');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SK}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message ?? 'Stripe error');

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('PatriotsClub checkout error:', err);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
