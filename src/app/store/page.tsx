import Link from 'next/link';
import { dataverse } from '@/lib/dataverse';
import StoreClient, { type Product } from './StoreClient';

interface DvProduct {
  bb_productid: string;
  bb_productname: string;
  bb_productnumber: string;
  bb_price: number;
  bb_producttype: number;
  bb_productmaterial?: number;
  bb_productsize?: number;
  'bb_productmaterial@OData.Community.Display.V1.FormattedValue'?: string;
  'bb_productsize@OData.Community.Display.V1.FormattedValue'?: string;
}

interface DvProductImage {
  _bb_product_value: string;
  bb_imageurl: string;
  bb_alttext?: string;
}

async function getProducts(): Promise<Product[]> {
  const [productsRes, imagesRes] = await Promise.all([
    dataverse.get<{ value: DvProduct[] }>(
      'bb_products?$filter=statecode eq 0 and bb_displayinstore eq true' +
      '&$select=bb_productid,bb_productname,bb_productnumber,bb_price,bb_producttype,bb_productmaterial,bb_productsize' +
      '&$orderby=bb_productnumber asc'
    ),
    dataverse.get<{ value: DvProductImage[] }>(
      'bb_productimages?$filter=statecode eq 0 and bb_isprimary eq true' +
      '&$select=_bb_product_value,bb_imageurl,bb_alttext'
    ),
  ]);

  const imageMap = new Map<string, DvProductImage>();
  for (const img of imagesRes.value ?? []) {
    imageMap.set(img._bb_product_value, img);
  }

  return (productsRes.value ?? []).map((p) => {
    const img = imageMap.get(p.bb_productid);
    return {
      ...p,
      imageUrl: img?.bb_imageurl,
      imageAlt: img?.bb_alttext,
      materialLabel: p['bb_productmaterial@OData.Community.Display.V1.FormattedValue'] ?? null,
      sizeLabel: p['bb_productsize@OData.Community.Display.V1.FormattedValue'] ?? null,
    };
  });
}

export default async function StorePage() {
  let products: Product[] = [];
  let error: unknown = null;
  try {
    products = await getProducts();
  } catch (err) {
    console.error('Store fetch error:', err);
    error = err;
  }

  if (error) return <div>Error: {String(error)}</div>;

  return (
    <>
      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 10px 0',
          }}>
            ★ BannerBeauty Store
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            margin: '0 0 24px 0',
          }}>
            Quality American flags, poles, and accessories
          </p>

          {/* Nudge banner */}
          <Link
            href="/submit-banner"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(197,160,40,0.15)',
              border: '1px solid #C5A028',
              borderRadius: 4,
              padding: '10px 18px',
              color: '#C5A028',
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '0.3px',
            }}
          >
            ★ Want to Banner Bump a Fellow Patriot? Start here →
          </Link>
        </div>
      </section>

      {/* Client section: filters + grid + cart */}
      <StoreClient products={products} />
    </>
  );
}
