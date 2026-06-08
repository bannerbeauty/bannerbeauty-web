'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  productid: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  producttype: number;
}

interface AppliedGC {
  code: string;
  amount: number;
  orderItemId: string;
  remainingBalance: number;
}

interface StoreOrder {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  gcTotal: number;
  appliedGCs: AppliedGC[];
  marketingOptin: boolean;
  hasGC: boolean;
  hasPhysical: boolean;
}

function buildItemsHtml(cart: CartItem[]): string {
  const rows = cart
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #EEEEEE;font-family:Trebuchet MS,sans-serif;font-size:0.88rem;color:#444444;">${item.name} &times; ${item.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #EEEEEE;text-align:right;font-family:Trebuchet MS,sans-serif;font-size:0.88rem;font-weight:700;color:#1B2A4A;">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

function buildGcCodesHtml(appliedGCs: AppliedGC[]): string {
  if (!appliedGCs.length) return '';
  return appliedGCs
    .map(
      (gc) =>
        `<div style="padding:4px 0;font-family:Trebuchet MS,sans-serif;font-size:0.85rem;color:#1B7A3E;">${gc.code} &mdash; &minus;$${gc.amount.toFixed(2)}</div>`
    )
    .join('');
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#C5A028',
  marginBottom: 16,
};

function StoreConfirmationInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [mounted, setMounted] = useState(false);
  const [gcCodes, setGcCodes] = useState<string[]>([]);
  const firedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('bb_store_order');
      if (raw) setOrder(JSON.parse(raw) as StoreOrder);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || !order || status !== 'success' || firedRef.current) return;
    firedRef.current = true;

    const itemsHtml = buildItemsHtml(order.cart);
    const gcCodesHtml = buildGcCodesHtml(order.appliedGCs ?? []);

    fetch('/api/flows/create-store-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phone: order.phone,
        address1: order.address1,
        address2: order.address2,
        city: order.city,
        state: order.state,
        zipcode: order.zipcode,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        gcTotal: order.gcTotal,
        hasGC: order.hasGC,
        hasPhysical: order.hasPhysical,
        marketingOptin: order.marketingOptin,
        cart: order.cart,
        appliedGCs: order.appliedGCs ?? [],
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data?.gcCodes && Array.isArray(data.gcCodes)) {
        setGcCodes(data.gcCodes);
      }
    })
    .catch((err) => console.error('create-store-order error:', err));

    fetch('/api/flows/email-store-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        hasGC: order.hasGC,
        itemsHtml,
        gcCodesHtml,
      }),
    }).catch((err) => console.error('email-store-order error:', err));

    sessionStorage.removeItem('bb_cart');
    sessionStorage.removeItem('bb_store_order');
    sessionStorage.removeItem('bb_applied_gcs');
    sessionStorage.removeItem('bb_gc_total');
  }, [mounted, order, status]);

  if (!mounted) return null;

  // ── Failure ──────────────────────────────────────────────────────────────
  if (status !== 'success') {
    return (
      <div style={{
        background: '#FAF7F2',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', color: '#B22234', marginBottom: 16 }}>✗</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#B22234', margin: '0 0 16px' }}>
            Payment Not Completed
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#555555', lineHeight: 1.7, marginBottom: 32 }}>
            Your payment was not processed. No charges were made. Please try again or contact us if the problem continues.
          </p>
          <Link
            href="/checkout"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#B22234',
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#E8F5E9',
            border: '2px solid #1B7A3E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '2.2rem',
            color: '#1B7A3E',
          }}>
            ✓
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 14px',
          }}>
            Thank You for Your Order!
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#555555', lineHeight: 1.7, margin: 0 }}>
            {order?.email ? (
              <>A confirmation has been sent to <strong>{order.email}</strong>.</>
            ) : (
              'Your order has been received and a confirmation email is on its way.'
            )}
          </p>
        </div>

        {/* Order summary card */}
        {order && (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 28, marginBottom: 28 }}>
            <div style={sectionLabelStyle}>★ Order Summary</div>

            {order.cart.map((item) => (
              <div
                key={item.productid}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #F5F5F5',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.88rem',
                }}
              >
                <span style={{ color: '#444444' }}>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 700, color: '#1B2A4A' }}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.hasPhysical && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                  <span>Shipping</span><span>${order.shipping.toFixed(2)}</span>
                </div>
              )}
              {order.gcTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B7A3E' }}>
                  <span>Gift Certificate</span><span>−${order.gcTotal.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'Georgia, serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1B2A4A',
                borderTop: '1px solid #EEEEEE',
                paddingTop: 10,
                marginTop: 4,
              }}>
                <span>Total Charged</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {order.hasPhysical && order.address1 && (
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #EEEEEE',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                color: '#555555',
                lineHeight: 1.6,
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 6 }}>
                  Ships To
                </div>
                <div>{order.firstName} {order.lastName}</div>
                <div>{order.address1}{order.address2 ? `, ${order.address2}` : ''}</div>
                <div>{order.city}, {order.state} {order.zipcode}</div>
              </div>
            )}
          </div>
        )}

        {/* Gift certificate codes */}
        {gcCodes.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '2px solid #1B7A3E', padding: 28, marginBottom: 28 }}>
            <div style={{ ...sectionLabelStyle, color: '#1B7A3E' }}>★ Your Gift Certificate Codes</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.6, margin: '0 0 16px' }}>
              Save these codes — they can be used at checkout on any future order.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gcCodes.map((code) => (
                <div
                  key={code}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1B7A3E',
                    background: '#E8F5E9',
                    border: '1px solid #A5D6A7',
                    borderRadius: 4,
                    padding: '10px 16px',
                    letterSpacing: '1.5px',
                    userSelect: 'all',
                  }}
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          <Link
            href="/store"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: '#1B2A4A',
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/submit-banner"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: '#B22234',
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            ★ Banner Bump a Patriot
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA', margin: 0 }}>
          Questions? Contact us at{' '}
          <a href="mailto:hello@bannerbeauty.com" style={{ color: '#1B2A4A' }}>hello@bannerbeauty.com</a>
        </p>
      </div>
    </div>
  );
}

export default function StoreConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <StoreConfirmationInner />
    </Suspense>
  );
}
