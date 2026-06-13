import type { NextRequest } from 'next/server';

const STRIPE_SK = process.env.STRIPE_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await req.json();
    if (!paymentIntentId || !orderId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('metadata[orderId]', orderId);

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SK}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Stripe update failed');
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Update payment intent error:', err);
    return Response.json({ error: 'Failed to update payment intent' }, { status: 500 });
  }
}
