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

        {/* Share */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '24px 28px', marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 16 }}>
            ★ Spread the Word ★
          </div>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', margin: '0 0 20px', lineHeight: 1.6 }}>
            Share your Banner Bump and inspire others to help a fellow patriot!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://www.bannerbeauty.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1877F2', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com/intent/tweet?text=I%20just%20Banner%20Bumped%20a%20neighbor!%20%F0%9F%87%BA%F0%9F%87%B8%20Helping%20a%20fellow%20patriot%20fly%20their%20flag%20with%20pride.%20Join%20me%20at%20BannerBeauty.com%20%23BannerBeauty%20%23PatrioticNeighbors%20%23America250&url=https://www.bannerbeauty.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#000000', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url=https://www.bannerbeauty.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0A66C2', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>

            {/* SMS */}
            <a
              href="sms:?body=I%20just%20Banner%20Bumped%20a%20neighbor!%20%F0%9F%87%BA%F0%9F%87%B8%20Helping%20a%20fellow%20patriot%20fly%20their%20flag%20with%20pride.%20Check%20out%20BannerBeauty.com%20%23BannerBeauty"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1B7A3E', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              SMS
            </a>

            {/* Copy Link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://www.bannerbeauty.com');
                alert('Link copied!');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#C5A028', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              Copy Link
            </button>

          </div>
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
