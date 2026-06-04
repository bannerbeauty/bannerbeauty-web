'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface RecipientData {
  firstName?: string;
  lastName?: string;
  address?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

interface BannerOrder {
  inFirstName: string;
  inEmail: string;
  recipientData: RecipientData;
  bannerOptionName: string;
  letterTemplateName: string;
  subtotal: number;
  total: number;
  qrToken: string;
  orderId: string;
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#C5A028',
  marginBottom: 16,
};

function BannerBumpConfirmationInner() {
  const searchParams = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status') ?? '';

  const [order, setOrder] = useState<BannerOrder | null>(null);
  const [mounted, setMounted] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('bb_banner_order');
      if (raw) setOrder(JSON.parse(raw) as BannerOrder);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || !order || redirectStatus !== 'succeeded' || firedRef.current) return;
    firedRef.current = true;

    const r = order.recipientData ?? {};
    const recipientFirstName = r.firstName ?? '';
    const recipientLastName = r.lastName ?? '';
    const recipientAddress =
      r.address ??
      [r.address1, r.address2, r.city && r.state ? `${r.city}, ${r.state}` : r.city ?? r.state, r.zipcode]
        .filter(Boolean)
        .join(' ');

    fetch('/api/flows/email-banner-bump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: order.inFirstName,
        email: order.inEmail,
        recipientFirstName,
        recipientLastName,
        recipientAddress,
        bannerOption: order.bannerOptionName,
        letterTemplateName: order.letterTemplateName,
        subtotal: order.subtotal,
        total: order.total,
        qrToken: order.qrToken,
        orderId: order.orderId,
      }),
    }).catch((err) => console.error('email-banner-bump error:', err));

    sessionStorage.removeItem('bb_banner_order');
    sessionStorage.removeItem('bb_bannerId');
    sessionStorage.removeItem('bb_photoBase64');
    sessionStorage.removeItem('bb_photoMime');
  }, [mounted, order, redirectStatus]);

  if (!mounted) return null;

  // ── Failure ───────────────────────────────────────────────────────────────
  if (redirectStatus !== 'succeeded') {
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
            Your Banner Bump payment was not processed. No charges were made. Please try again or contact us if the problem continues.
          </p>
          <Link
            href="/submit-banner"
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
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🇺🇸</div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 14px',
          }}>
            Your Banner Bump is on its way!
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#555555', lineHeight: 1.7, margin: 0 }}>
            {order?.inEmail ? (
              <>A confirmation has been sent to <strong>{order.inEmail}</strong>.</>
            ) : (
              'Your Banner Bump has been submitted and a confirmation email is on its way.'
            )}
          </p>
        </div>

        {/* Order details card */}
        {order && (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 28, marginBottom: 28 }}>
            <div style={sectionLabelStyle}>★ Banner Bump Details</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem' }}>
              {order.bannerOptionName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888888' }}>Banner Option</span>
                  <span style={{ color: '#1B2A4A', fontWeight: 700 }}>{order.bannerOptionName}</span>
                </div>
              )}
              {order.letterTemplateName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888888' }}>Letter Template</span>
                  <span style={{ color: '#1B2A4A', fontWeight: 700 }}>{order.letterTemplateName}</span>
                </div>
              )}
              {(order.recipientData?.firstName || order.recipientData?.lastName) && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888888' }}>Recipient</span>
                  <span style={{ color: '#1B2A4A', fontWeight: 700 }}>
                    {[order.recipientData.firstName, order.recipientData.lastName].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #EEEEEE', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.subtotal !== order.total && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'Georgia, serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1B2A4A',
              }}>
                <span>Total Charged</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {order.orderId && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #EEEEEE', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA' }}>
                Order ID: {order.orderId}
              </div>
            )}
          </div>
        )}

        {/* Patriotic message */}
        <div style={{
          background: '#1B2A4A',
          borderRadius: 8,
          padding: '24px 28px',
          marginBottom: 28,
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#FFFFFF', lineHeight: 1.7, margin: 0 }}>
            ★ &nbsp;Thank you for helping a fellow patriot fly their flag with pride. Every Banner Bump strengthens our neighborhoods.&nbsp; ★
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
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
            ★ Banner Bump Another Patriot
          </Link>
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
            Visit Store
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

export default function BannerBumpConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <BannerBumpConfirmationInner />
    </Suspense>
  );
}
