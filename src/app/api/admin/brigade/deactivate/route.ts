import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { brigadeId } = await req.json();
    if (!brigadeId) return Response.json({ error: 'Missing brigadeId' }, { status: 400 });
    await dataverse.patch('bb_brigades', brigadeId, { statecode: 1 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Deactivate brigade failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
