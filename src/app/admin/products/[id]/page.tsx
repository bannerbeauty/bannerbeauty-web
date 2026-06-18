import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import ProductEditClient from './ProductEditClient';

export interface ProductImage {
  imageId: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDetail {
  productId: string;
  productNumber: string;
  productName: string;
  productType: number;
  productMaterial: number | null;
  productSize: number | null;
  price: number;
  displayInStore: boolean;
  stripeTaxCode: string;
  productDescription: string;
  sortOrder: number;
  stockStatus: number;
  heightIn: number | null;
  lengthIn: number | null;
  widthIn: number | null;
  weightOz: number | null;
  isActive: boolean;
  images: ProductImage[];
}

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  const isNew = id === 'new';
  let product: ProductDetail | null = null;

  if (!isNew) {
    try {
      const [productRes, imagesRes] = await Promise.all([
        dataverse.get<any>(
          `bb_products(${id})?$select=bb_productid,bb_productnumber,bb_productname,bb_producttype,bb_productmaterial,bb_productsize,bb_price,bb_displayinstore,bb_stripetaxcode,bb_productdescription,bb_sortorder,bb_stockstatus,bb_heightin,bb_lengthin,bb_widthin,bb_weightoz,statecode`
        ),
        dataverse.get<{ value: any[] }>(
          `bb_productimages?$filter=_bb_product_value eq '${id}' and statecode eq 0&$select=bb_productimageid,bb_imageurl,bb_alttext,bb_isprimary,bb_sortorder&$orderby=bb_sortorder asc`
        ),
      ]);

      product = {
        productId: productRes.bb_productid,
        productNumber: productRes.bb_productnumber ?? '',
        productName: productRes.bb_productname ?? '',
        productType: productRes.bb_producttype ?? 0,
        productMaterial: productRes.bb_productmaterial ?? null,
        productSize: productRes.bb_productsize ?? null,
        price: productRes.bb_price ?? 0,
        displayInStore: productRes.bb_displayinstore ?? true,
        stripeTaxCode: productRes.bb_stripetaxcode ?? '',
        productDescription: productRes.bb_productdescription ?? '',
        sortOrder: productRes.bb_sortorder ?? 0,
        stockStatus: productRes.bb_stockstatus ?? 121120000,
        heightIn: productRes.bb_heightin ?? null,
        lengthIn: productRes.bb_lengthin ?? null,
        widthIn: productRes.bb_widthin ?? null,
        weightOz: productRes.bb_weightoz ?? null,
        isActive: productRes.statecode === 0,
        images: (imagesRes.value ?? []).map((img: any) => ({
          imageId: img.bb_productimageid,
          imageUrl: img.bb_imageurl ?? '',
          altText: img.bb_alttext ?? '',
          isPrimary: img.bb_isprimary ?? false,
          sortOrder: img.bb_sortorder ?? 0,
        })),
      };
    } catch (err) {
      console.error('Product fetch failed:', err);
    }
  }

  return <ProductEditClient product={product} isNew={isNew} />;
}
