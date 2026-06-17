import type { NextRequest } from 'next/server';

const SINCH_AUTH = process.env.SINCH_AUTH_BASE64!;
const SINCH_BASE_URL = 'https://verification.api.sinch.com';

function getAuthHeader(): string {
  return `Basic ${SINCH_AUTH}`;
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
