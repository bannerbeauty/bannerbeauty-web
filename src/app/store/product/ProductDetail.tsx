'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface ProductDetailProps {
  productid: string;
  productname: string;
  productnumber: string;
  price: number;
  producttype: number;
  description?: string;
  images: { url: string; alt?: string; isPrimary: boolean }[];
}

interface CartItem {
  productid: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  producttype: number;
}

const TRUST_BADGES = [
  { icon: '🦅', label: 'Patriotic Quality' },
  { icon: '🚚', label: 'Fast Shipping' },
  { icon: '⭐', label: 'Satisfaction Guaranteed' },
];

export default function ProductDetail({
  productid,
  productname,
  productnumber,
  price,
  producttype,
  description,
  images,
}: ProductDetailProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const activeImage = images[activeIdx];

  function addToCart() {
    const raw = sessionStorage.getItem('bb_cart');
    let cart: CartItem[] = [];
    try { cart = raw ? JSON.parse(raw) : []; } catch {}

    const existing = cart.find((i) => i.productid === productid);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productid, name: productname, sku: productnumber, price, qty, producttype });
    }

    sessionStorage.setItem('bb_cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 48,
        alignItems: 'start',
      }}
      className="bb-product-grid"
      >
        {/* Image gallery */}
        <div>
          <div style={{
            background: '#F5F5F5',
            borderRadius: 8,
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            border: '1px solid #EEEEEE',
          }}>
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.url}
                alt={activeImage.alt || productname}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '5rem', opacity: 0.2 }}>🇺🇸</span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    width: 64,
                    height: 64,
                    border: i === activeIdx ? '2px solid #1B2A4A' : '2px solid transparent',
                    borderRadius: 4,
                    overflow: 'hidden',
                    padding: 0,
                    cursor: 'pointer',
                    background: '#F5F5F5',
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || productname}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.72rem',
            color: '#AAAAAA',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            SKU: {productnumber}
          </div>

          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 16px 0',
            lineHeight: 1.25,
          }}>
            {productname}
          </h1>

          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#B22234',
            marginBottom: 24,
          }}>
            ${price.toFixed(2)}
          </div>

          {description && (
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              style={{
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.95rem',
                color: '#555555',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            />
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#888888',
            }}>
              Qty
            </span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #DDDDDD', borderRadius: 4, overflow: 'hidden' }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, border: 'none', background: '#F5F5F5', cursor: 'pointer', fontSize: '1rem', color: '#1B2A4A', fontWeight: 700 }}
              >
                −
              </button>
              <span style={{ width: 40, textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A' }}>
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{ width: 36, height: 36, border: 'none', background: '#F5F5F5', cursor: 'pointer', fontSize: '1rem', color: '#1B2A4A', fontWeight: 700 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={addToCart}
            style={{
              width: '100%',
              padding: '16px',
              background: added ? '#1B7A3E' : '#B22234',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: 12,
            }}
          >
            {added ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>

          <Link
            href="/store"
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.82rem',
              color: '#888888',
              textDecoration: 'none',
              marginBottom: 32,
            }}
          >
            ← Back to Store
          </Link>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            gap: 16,
            borderTop: '1px solid #EEEEEE',
            paddingTop: 24,
            flexWrap: 'wrap',
          }}>
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>{badge.icon}</span>
                <span style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.75rem',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .bb-product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
