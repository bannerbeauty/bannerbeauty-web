'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessInner() {
  const searchParams = useSearchParams();
  const neighborId = searchParams.get('neighborId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !neighborId) return;
    // Trigger flow to update Dataverse
    fetch('/api/flows/patriotsclub-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ neighborId, sessionId }),
    }).catch(err => console.error('PatriotsClub activate error:', err));
  }, [sessionId, neighborId]);

  return (
    <div style={{
      background: '#FAF7F2',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>★</div>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: '#1B2A4A',
          margin: '0 0 16px',
        }}>
          Welcome to the Patriot&apos;s Club!
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.95rem',
          color: '#555555',
          lineHeight: 1.7,
          margin: '0 0 32px',
        }}>
          Your 12 Banner Bumps are being loaded now. You&apos;ll see your balance on your profile shortly.
          Thank you for your commitment to building patriotic neighborhoods! 🇺🇸
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/submit-banner" style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#B22234',
            color: '#FFFFFF',
            borderRadius: 4,
            fontFamily: 'Georgia, serif',
            fontSize: '0.95rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            ★ Banner Bump Now
          </Link>
          <Link href="/community" style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#1B2A4A',
            color: '#FFFFFF',
            borderRadius: 4,
            fontFamily: 'Georgia, serif',
            fontSize: '0.95rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            Go to Community
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PatriotsClubSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
