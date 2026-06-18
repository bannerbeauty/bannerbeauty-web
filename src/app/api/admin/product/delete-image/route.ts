import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { imageId } = await req.json();
    if (!imageId) return Response.json({ error: 'Missing imageId' }, { status: 400 });
    await dataverse.patch('bb_productimages', imageId, { statecode: 1 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Delete product image failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
