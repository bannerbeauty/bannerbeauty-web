import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code, verificationId } = await req.json();

    if (!phoneNumber || !code) {
      return Response.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    // Verify OTP with Sinch
    const sinchRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/sinch/verify-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code, verificationId }),
      }
    );

    const sinchData = await sinchRes.json();
    if (!sinchData.verified) {
      return Response.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    // Look up Neighbor by phone number
    const neighborRes = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_phone eq '${phoneNumber}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_displayname,bb_handle` +
      `&$top=1`
    );

    const neighbor = neighborRes.value?.[0] ?? null;

    if (!neighbor) {
      // New user — return flag to trigger registration
      return Response.json({ newUser: true, phoneNumber });
    }

    // Set session
    const session = await getSession();
    session.neighborId = neighbor.bb_neighborid;
    session.phone = phoneNumber;
    session.isLoggedIn = true;
    session.isAdmin = phoneNumber === ADMIN_PHONE;
    await session.save();

    return Response.json({
      ok: true,
      newUser: false,
      neighborId: neighbor.bb_neighborid,
    });
  } catch (err) {
    console.error('Auth verify error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
