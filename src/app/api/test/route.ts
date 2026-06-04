import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';

export async function GET() {
  const session = await auth();
  const products = await dataverse.get('bb_products?$top=3&$select=bb_productname,bb_price');
  return Response.json({ session, products });
}
