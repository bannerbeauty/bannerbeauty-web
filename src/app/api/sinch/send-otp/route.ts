import type { NextRequest } from 'next/server';

const APP_KEY = process.env.SINCH_APPLICATION_KEY!;
const APP_SECRET = process.env.SINCH_APPLICATION_SECRET!;
const SINCH_BASE_URL = 'https://verification.api.sinch.com';

console.log('Sinch key length:', APP_KEY?.length, 'Secret length:', APP_SECRET?.length);

function getAuthHeader(): string {
  const credentials = Buffer.from(`${APP_KEY}:${APP_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const res = await fetch(`${SINCH_BASE_URL}/verification/v1/verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        identity: {
          type: 'number',
          endpoint: phoneNumber,
        },
        method: 'sms',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Sinch send-otp error:', data);
      return Response.json({ error: data.message ?? 'Failed to send OTP' }, { status: res.status });
    }

    return Response.json({ id: data.id, status: 'sent' });
  } catch (err) {
    console.error('send-otp error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
