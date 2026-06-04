'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface Product {
  bb_productid: string;
  bb_productname: string;
  bb_productnumber: string;
  bb_price: number;
  bb_producttype: number;
  imageUrl?: string;
  imageAlt?: string;
}

interface CartItem {
  productid: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  producttype: number;
}

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'Flags', value: 121120000 },
  { label: 'Poles', value: 121120001 },
  { label: 'Kits', value: 121120002 },
  { label: 'Accessories', value: 121120003 },
  { label: 'Gift Certificates', value: 121120004 },
];

function formatPrice(price: number) {
  return '$' + price.toFixed(2);
}

export default function StoreClient({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('bb_cart');
    if (raw) {
      try {
        const cart: CartItem[] = JSON.parse(raw);
        setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      } catch {}
    }
  }, []);

  function addToCart(product: Product) {
    const raw = sessionStorage.getItem('bb_cart');
    let cart: CartItem[] = [];
    try { cart = raw ? JSON.parse(raw) : []; } catch {}

    const existing = cart.find((i) => i.productid === product.bb_productid);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        productid: product.bb_productid,
        name: product.bb_productname,
        sku: product.bb_productnumber,
        price: product.bb_price,
        qty: 1,
        producttype: product.bb_producttype,
      });
    }

    sessionStorage.setItem('bb_cart', JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + i.qty, 0));
    setAddedId(product.bb_productid);
    setTimeout(() => setAddedId(null), 1800);
  }

  const filtered = activeCategory === null
    ? products
    : products.filter((p) => p.bb_producttype === activeCategory);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '60vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px' }}>

        {/* Cart indicator */}
        {cartCount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px 0 0',
          }}>
            <Link href="/checkout" style={{
              background: '#1B2A4A',
              color: '#FFFFFF',
              fontFamily: 'Georgia, serif',
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: 4,
              textDecoration: 'none',
            }}>
              🛒 Cart ({cartCount})
            </Link>
          </div>
        )}

        {/* Category filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '28px 0 32px',
        }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 4,
                  border: active ? 'none' : '1.5px solid #CCCCCC',
                  background: active ? '#1B2A4A' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#444444',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#888888',
            fontFamily: 'Trebuchet MS, sans-serif',
          }}>
            No products found in this category.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {filtered.map((product) => {
              const isAdded = addedId === product.bb_productid;
              return (
                <div
                  key={product.bb_productid}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: '1px solid #EEEEEE',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    boxShadow: '0 2px 8px rgba(27,42,74,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,42,74,0.14)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,42,74,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{
                    background: '#F5F5F5',
                    aspectRatio: '4 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt || product.bb_productname}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3rem', opacity: 0.3 }}>🇺🇸</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.72rem',
                      color: '#AAAAAA',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>
                      {product.bb_productnumber}
                    </div>
                    <h3 style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1B2A4A',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                      flex: 1,
                    }}>
                      {product.bb_productname}
                    </h3>
                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#B22234',
                      marginBottom: 16,
                    }}>
                      {formatPrice(product.bb_price)}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/store/product?sku=${product.bb_productnumber}`}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          border: '1.5px solid #1B2A4A',
                          borderRadius: 4,
                          color: '#1B2A4A',
                          fontFamily: 'Georgia, serif',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          textAlign: 'center',
                        }}
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          background: isAdded ? '#1B7A3E' : '#B22234',
                          border: 'none',
                          borderRadius: 4,
                          color: '#FFFFFF',
                          fontFamily: 'Georgia, serif',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        {isAdded ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
