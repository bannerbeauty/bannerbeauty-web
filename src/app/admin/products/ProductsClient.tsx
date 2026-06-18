'use client';

import Link from 'next/link';
import type { AdminProduct } from './page';

export default function ProductsClient({ products }: { products: AdminProduct[] }) {
  const grouped = products.reduce((acc, p) => {
    const key = p.productTypeLabel || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, AdminProduct[]>);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Products
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/products/new" style={{ background: '#1B7A3E', color: '#FFFFFF', padding: '8px 16px', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
            + New Product
          </Link>
          <Link href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888888', marginBottom: 10 }}>
              {type}
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
              {items.map((p, i) => (
                <Link key={p.productId} href={`/admin/products/${p.productId}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 100px 100px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < items.length - 1 ? '1px solid #F5F5F5' : 'none',
                    opacity: p.isActive ? 1 : 0.5,
                  }}>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                      {p.productNumber}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#1B2A4A', fontWeight: 600 }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A' }}>
                      ${p.price.toFixed(2)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: p.isActive ? '#1B7A3E' : '#B22234' }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
