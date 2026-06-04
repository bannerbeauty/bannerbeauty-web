import { dataverse } from '@/lib/dataverse';

export async function GET() {
  try {
    const products = await dataverse.get('bb_products?$top=3&$select=bb_productname,bb_price');
    return Response.json({ success: true, products });
  } catch (err) {
    return Response.json({ success: false, error: String(err) });
  }
}
