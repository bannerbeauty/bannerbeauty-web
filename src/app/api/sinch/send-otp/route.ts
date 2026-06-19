import type { NextRequest } from 'next/server';
import { getSinchHeaders } from '@/lib/sinch-auth';

const SINCH_BASE_URL = 'https://verification.api.sinch.com';
const PATH = '/verification/v1/verifications';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const body = JSON.stringify({
      identity: { type: 'number', endpoint: phoneNumber },
      method: 'sms',
    });

    const headers = getSinchHeaders('POST', PATH, body, 'application/json');

    const res = await fetch(`${SINCH_BASE_URL}${PATH}`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Sinch send-otp error:', data);
      return Response.json({ error: data.message ?? 'Failed to send OTP' }, { status: res.status });
    }

    return Response.json({ id: data.id, status: 'sent' });
  } catch (err) {
    console.error('send-otp error:', err instanceof Error ? err.message : err);
    console.error('send-otp error stack:', err instanceof Error ? err.stack : 'no stack');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
