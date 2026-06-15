import type { NextRequest } from 'next/server';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.split('=')[1]);

  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return signatures.some(s => s === expectedSig);
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  // Verify signature
  const isValid = await verifyStripeSignature(payload, signature, WEBHOOK_SECRET);
  if (!isValid) {
    console.error('Stripe webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }

  const paymentIntent = event.data?.object;
  const orderId = paymentIntent?.metadata?.orderId ?? '';
  const paymentIntentId = paymentIntent?.id ?? '';
  const neighborId = paymentIntent?.metadata?.neighborId ?? '';
  const isBannerBump = paymentIntent?.metadata?.isBannerBump === 'true';
  const isPatriotsClubPurchase = paymentIntent?.metadata?.isPatriotsClubPurchase === 'true';

  if (event.type === 'payment_intent.succeeded') {
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/flows/update-order-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentIntentId,
          paymentStatus: 121120001, // Paid
          paymentDatetime: new Date().toISOString(),
          neighborId,
          isBannerBump,
          isPatriotsClubPurchase,
          orderTotal: (paymentIntent?.amount ?? 0) / 100,
        }),
      });
    } catch (err) {
      console.error('Failed to update order payment status:', err);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/flows/update-order-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentIntentId,
          paymentStatus: 121120002, // Failed
          paymentDatetime: new Date().toISOString(),
          neighborId,
          isBannerBump,
          isPatriotsClubPurchase,
          orderTotal: (paymentIntent?.amount ?? 0) / 100,
        }),
      });
    } catch (err) {
      console.error('Failed to update order payment status:', err);
    }
  }

  return new Response('OK', { status: 200 });
}
