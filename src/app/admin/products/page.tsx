import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import ProductsClient from './ProductsClient';

export interface AdminProduct {
  productId: string;
  name: string;
  productNumber: string;
  price: number;
  productType: number;
  productTypeLabel: string;
  isActive: boolean;
  stockStatusLabel: string;
}

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_products?$select=bb_productid,bb_productname,bb_productnumber,bb_price,bb_producttype,statecode,bb_stockstatus` +
      `&$orderby=bb_producttype asc,bb_sortorder asc`
    );

    const products: AdminProduct[] = (res.value ?? []).map((p: any) => ({
      productId: p.bb_productid,
      name: p.bb_productname ?? '',
      productNumber: p.bb_productnumber ?? '',
      price: p.bb_price ?? 0,
      productType: p.bb_producttype ?? 0,
      productTypeLabel: p['bb_producttype@OData.Community.Display.V1.FormattedValue'] ?? 'Other',
      isActive: p.statecode === 0,
      stockStatusLabel: p['bb_stockstatus@OData.Community.Display.V1.FormattedValue'] ?? '',
    }));

    return <ProductsClient products={products} />;
  } catch (err) {
    console.error('Admin products fetch failed:', err);
    return <ProductsClient products={[]} />;
  }
}
