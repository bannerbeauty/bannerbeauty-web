import type { NextRequest } from 'next/server';

const APP_KEY = process.env.SINCH_APPLICATION_KEY!;
const APP_SECRET = process.env.SINCH_APPLICATION_SECRET!;
const SINCH_BASE_URL = 'https://verification.api.sinch.com';

function getAuthHeader(): string {
  const raw = `${APP_KEY}:${APP_SECRET}`;
  const encoded = Buffer.from(raw, 'utf8').toString('base64');
  console.log('Auth raw length:', raw.length, 'Encoded length:', encoded.length);
  return `Basic ${encoded}`;
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code } = await req.json();
    if (!phoneNumber || !code) {
      return Response.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    const res = await fetch(
      `${SINCH_BASE_URL}/verification/v1/verifications/number/${encodeURIComponent(phoneNumber)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({
          method: 'sms',
          sms: {
            code: code,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Sinch verify-otp error:', data);
      return Response.json({ error: data.message ?? 'Verification failed' }, { status: res.status });
    }

    const verified = data.status === 'SUCCESSFUL';
    return Response.json({ verified, status: data.status });
  } catch (err) {
    console.error('verify-otp error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
