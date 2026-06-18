import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, message, imageUrl } = await req.json();
    if (!title || !message) return Response.json({ error: 'Missing fields' }, { status: 400 });
    const result = await dataverse.post('bb_announcements', {
      bb_title: title,
      bb_message: message,
      bb_imageurl: imageUrl || '',
      bb_isactive: true,
    }) as Record<string, string>;
    return Response.json({ ok: true, announcementId: result.bb_announcementid });
  } catch (err) {
    console.error('Create announcement failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
