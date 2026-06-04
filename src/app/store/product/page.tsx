import { redirect } from 'next/navigation';
import Link from 'next/link';
import { dataverse } from '@/lib/dataverse';
import ProductDetail from './ProductDetail';

function extractDescriptionText(html: string): string {
  if (!html) return '';
  const match = html.match(/<div[^>]*ck-content[^>]*>([\s\S]*?)<\/div>/);
  if (match) return match[1].trim();
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

interface DvProduct {
  bb_productid: string;
  bb_productname: string;
  bb_productnumber: string;
  bb_price: number;
  bb_producttype: number;
  bb_productdescription?: string;
  bb_stripetaxcode?: string;
}

interface DvProductImage {
  bb_imageurl: string;
  bb_alttext?: string;
  bb_isprimary: boolean;
  bb_sortorder?: number;
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sku } = await searchParams;

  if (!sku || typeof sku !== 'string') {
    redirect('/store');
  }

  let product: DvProduct | null = null;
  let images: DvProductImage[] = [];

  try {
    const productsRes = await dataverse.get<{ value: DvProduct[] }>(
      `bb_products?$filter=bb_productnumber eq '${sku}' and statecode eq 0` +
      `&$select=bb_productid,bb_productname,bb_productnumber,bb_price,bb_producttype,bb_productdescription,bb_stripetaxcode`
    );
    product = productsRes.value?.[0] ?? null;
  } catch (err) {
    console.error('Product fetch error:', err);
  }

  if (!product) {
    redirect('/store');
  }

  try {
    const imagesRes = await dataverse.get<{ value: DvProductImage[] }>(
      `bb_productimages?$filter=_bb_product_value eq '${product.bb_productid}' and statecode eq 0` +
      `&$select=bb_imageurl,bb_alttext,bb_isprimary,bb_sortorder&$orderby=bb_sortorder asc`
    );
    images = imagesRes.value ?? [];
  } catch (err) {
    console.error('Product images fetch error:', err);
  }

  const mappedImages = images.map((img) => ({
    url: img.bb_imageurl,
    alt: img.bb_alttext,
    isPrimary: img.bb_isprimary,
  }));

  // Put primary image first
  mappedImages.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEE' }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px 24px',
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.78rem',
          color: '#888888',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <Link href="/" style={{ color: '#888888', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/store" style={{ color: '#888888', textDecoration: 'none' }}>Store</Link>
          <span>›</span>
          <span style={{ color: '#1B2A4A', fontWeight: 700 }}>{product.bb_productname}</span>
        </div>
      </div>

      <ProductDetail
        productid={product.bb_productid}
        productname={product.bb_productname}
        productnumber={product.bb_productnumber}
        price={product.bb_price}
        producttype={product.bb_producttype}
        description={extractDescriptionText(product.bb_productdescription ?? '')}
        images={mappedImages}
      />
    </div>
  );
}
