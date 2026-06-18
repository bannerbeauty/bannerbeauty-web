import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { productId, isActive } = await req.json();
    if (!productId) return Response.json({ error: 'Missing productId' }, { status: 400 });
    await dataverse.patch('bb_products', productId, {
      statecode: isActive ? 0 : 1,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Toggle product active failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
