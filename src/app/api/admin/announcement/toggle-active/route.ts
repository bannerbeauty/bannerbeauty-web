import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { announcementId, isActive } = await req.json();
    if (!announcementId) return Response.json({ error: 'Missing announcementId' }, { status: 400 });
    await dataverse.patch('bb_announcements', announcementId, { bb_isactive: isActive });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Toggle announcement active failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
