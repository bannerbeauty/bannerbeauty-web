import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, firstName, lastName, email } = await req.json();

    if (!phoneNumber || !firstName || !lastName) {
      return Response.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Create new Neighbor record in Dataverse
    const newNeighbor = await dataverse.post('bb_neighbors', {
      bb_phone: phoneNumber,
      bb_firstname: firstName,
      bb_lastname: lastName,
      ...(email ? { bb_email: email } : {}),
    });

    const neighborId = newNeighbor.bb_neighborid;

    // Set session
    const session = await getSession();
    session.neighborId = neighborId;
    session.phone = phoneNumber;
    session.isLoggedIn = true;
    session.isAdmin = phoneNumber === ADMIN_PHONE;
    await session.save();

    return Response.json({ ok: true, neighborId });
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
