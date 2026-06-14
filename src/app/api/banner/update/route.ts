import type { NextRequest } from 'next/server';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  let body: {
    bannerId?: string;
    attributionName?: string;
    attributionText?: string;
    attributionPhotoUrl?: string;
    noteIn?: string;
    beforePhotoUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.bannerId) {
    return Response.json({ error: 'Missing bannerId' }, { status: 400 });
  }

  try {
    const patch: Record<string, unknown> = {
      bb_isfeatureable: false,
    };
    if (body.attributionName !== undefined) patch.bb_attributionname = body.attributionName;
    if (body.attributionText !== undefined) patch.bb_attributiontext = body.attributionText;
    if (body.attributionPhotoUrl !== undefined) patch.bb_attributionphoto = body.attributionPhotoUrl;
    if (body.noteIn !== undefined) patch.bb_notein = body.noteIn;
    if (body.beforePhotoUrl !== undefined) patch.bb_beforephotourl = body.beforePhotoUrl;

    await dataverse.patch('bb_banners', body.bannerId, patch);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Banner update failed:', err);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
