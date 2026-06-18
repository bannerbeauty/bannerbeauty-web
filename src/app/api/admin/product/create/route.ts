import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();

    const result = await dataverse.post('bb_products', {
      bb_productnumber: body.productNumber,
      bb_productname: body.productName,
      bb_producttype: body.productType,
      bb_productmaterial: body.productMaterial,
      bb_productsize: body.productSize,
      bb_price: body.price,
      bb_displayinstore: body.displayInStore,
      bb_stripetaxcode: body.stripeTaxCode,
      bb_productdescription: body.productDescription,
      bb_sortorder: body.sortOrder,
      bb_stockstatus: body.stockStatus,
      bb_heightin: body.heightIn,
      bb_lengthin: body.lengthIn,
      bb_widthin: body.widthIn,
      bb_weightoz: body.weightOz,
    }) as Record<string, string>;

    return Response.json({ ok: true, productId: result.bb_productid });
  } catch (err) {
    console.error('Create product failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
