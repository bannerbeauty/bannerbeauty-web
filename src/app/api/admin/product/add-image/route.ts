import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { productId, imageUrl, sortOrder } = await req.json();
    if (!productId || !imageUrl) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const result = await dataverse.post('bb_productimages', {
      'bb_Product@odata.bind': `/bb_products(${productId})`,
      bb_imageurl: imageUrl,
      bb_sortorder: sortOrder ?? 0,
      bb_isprimary: sortOrder === 0,
    }) as Record<string, string>;

    return Response.json({ ok: true, imageId: result.bb_productimageid });
  } catch (err) {
    console.error('Add product image failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
