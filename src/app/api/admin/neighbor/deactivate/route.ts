import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { neighborId } = await req.json();
    if (!neighborId) return Response.json({ error: 'Missing neighborId' }, { status: 400 });
    await dataverse.patch('bb_neighbors', neighborId, { statecode: 1, statuscode: 2 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Deactivate neighbor failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
