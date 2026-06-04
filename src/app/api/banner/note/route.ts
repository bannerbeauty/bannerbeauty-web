import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { bannerId?: string; note?: string; isPublicNote?: boolean; isPublicPhoto?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.bannerId) {
    return Response.json({ error: 'Missing bannerId' }, { status: 400 });
  }

  try {
    await dataverse.patch('bb_banners', body.bannerId, {
      bb_notern: body.note ?? '',
      bb_recipientrespondeddatetime: new Date().toISOString(),
      bb_ispublicnotern: body.isPublicNote ?? false,
      bb_ispublicphotorn: body.isPublicPhoto ?? false,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Save banner note failed:', err);
    return Response.json({ error: 'Save failed' }, { status: 500 });
  }
}
