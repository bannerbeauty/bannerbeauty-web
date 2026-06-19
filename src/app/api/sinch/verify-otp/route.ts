import type { NextRequest } from 'next/server';
import { getSinchHeaders } from '@/lib/sinch-auth';

const SINCH_BASE_URL = 'https://verification.api.sinch.com';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code } = await req.json();
    if (!phoneNumber || !code) {
      return Response.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    const unencodedPath = `/verification/v1/verifications/number/${phoneNumber}`;
    const encodedPath = `/verification/v1/verifications/number/${encodeURIComponent(phoneNumber)}`;
    const body = JSON.stringify({ method: 'sms', sms: { code } });
    const headers = getSinchHeaders('PUT', unencodedPath, body, 'application/json');

    const res = await fetch(`${SINCH_BASE_URL}${encodedPath}`, {
      method: 'PUT',
      headers,
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Sinch verify-otp error:', data);
      return Response.json({ error: data.message ?? 'Verification failed' }, { status: res.status });
    }

    const verified = data.status === 'SUCCESSFUL';
    return Response.json({ verified, status: data.status });
  } catch (err) {
    console.error('verify-otp error:', err instanceof Error ? err.message : err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
