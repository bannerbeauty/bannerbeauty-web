import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { productId, name, price } = await req.json();
    if (!productId) return Response.json({ error: 'Missing productId' }, { status: 400 });
    await dataverse.patch('bb_products', productId, {
      bb_productname: name,
      bb_price: price,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Update product failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
