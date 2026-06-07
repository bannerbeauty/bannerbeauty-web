'use client';

export default function FlagRegulationsInsertPage() {
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 4in 9in;
            margin: 0;
          }
          body { margin: 0; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print" style={{
        background: '#1B2A4A',
        padding: '16px 24px',
        textAlign: 'center',
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: '#B22234',
            color: '#FFFFFF',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            fontWeight: 700,
            padding: '12px 32px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🖨 Print Insert
        </button>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.82rem',
          margin: '8px 0 0',
        }}>
          Set paper size to 4&quot; × 9&quot; in your print dialog
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '4in',
        minHeight: '9in',
        margin: '32px auto',
        background: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        fontFamily: 'Georgia, serif',
      }}>

        {/* Header */}
        <div style={{
          background: '#1B2A4A',
          padding: '20px 20px 16px',
          textAlign: 'center',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://bannerbeautystorage.blob.core.windows.net/logos/bannerbeauty-wordmark-logo-horizontal.png"
            alt="Banner Beauty"
            style={{ width: '180px', height: 'auto' }}
          />
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '7px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#C5A028',
            marginTop: 6,
          }}>
            ★ Building Patriotic Neighborhoods ★
          </div>
        </div>

        {/* Title */}
        <div style={{
          background: '#B22234',
          padding: '10px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            U.S. Flag Code — Quick Reference
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 18px', fontSize: '8px', lineHeight: 1.6, color: '#333333' }}>

          {/* Section 1 */}
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '7.5px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#C5A028',
            marginBottom: 6,
            borderBottom: '1px solid #C5A028',
            paddingBottom: 3,
          }}>
            🏠 Displaying Your Flag
          </div>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: 14 }}>
            <li style={{ marginBottom: 4 }}>Fly from sunrise to sunset; 24 hours if properly illuminated.</li>
            <li style={{ marginBottom: 4 }}>Take it down during storms unless it&apos;s an all-weather flag.</li>
            <li style={{ marginBottom: 4 }}>The union (stars) should always be at the top and to the flag&apos;s own right.</li>
            <li>The flag must never touch the ground, floor, or water.</li>
          </ul>

          {/* Section 2 */}
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '7.5px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#C5A028',
            marginBottom: 6,
            borderBottom: '1px solid #C5A028',
            paddingBottom: 3,
          }}>
            🎖️ Respecting Old Glory
          </div>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: 14 }}>
            <li style={{ marginBottom: 4 }}>Never use the flag as clothing, bedding, or drapery.</li>
            <li style={{ marginBottom: 4 }}>Never place any mark, design, or advertising on the flag.</li>
            <li style={{ marginBottom: 4 }}>The flag dips to no earthly king — never dip it to any person or thing.</li>
            <li>Stand at attention with hand over heart during the Pledge and National Anthem.</li>
          </ul>

          {/* Section 3 */}
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '7.5px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#C5A028',
            marginBottom: 6,
            borderBottom: '1px solid #C5A028',
            paddingBottom: 3,
          }}>
            🔥 Retiring a Worn Flag
          </div>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: 14 }}>
            <li style={{ marginBottom: 4 }}>A worn or tattered flag should be retired with dignity — never thrown in the trash.</li>
            <li style={{ marginBottom: 4 }}>The preferred method is burning in a dignified ceremony.</li>
            <li>Contact your local American Legion or VFW post for free flag retirement.</li>
          </ul>

          {/* Source note */}
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '6.5px',
            color: '#AAAAAA',
            textAlign: 'center',
            borderTop: '1px solid #EEEEEE',
            paddingTop: 8,
            marginBottom: 8,
          }}>
            Source: U.S. Flag Code, 4 U.S.C. § 1 et seq. · bannerbeauty.com/flag-regulations
          </div>

        </div>

        {/* Footer with QR */}
        <div style={{
          background: '#1B2A4A',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '7px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.6,
            flex: 1,
          }}>
            <div style={{ color: '#C5A028', fontWeight: 700, marginBottom: 3 }}>
              ★ Banner Bump a Neighbor
            </div>
            Scan to visit BannerBeauty.com and help a fellow patriot with a tattered flag.
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.bannerbeauty.com&bgcolor=1B2A4A&color=FFFFFF&qzone=1"
            alt="QR code"
            width={60}
            height={60}
            style={{ flexShrink: 0, borderRadius: 4 }}
          />
        </div>

      </div>
    </>
  );
}
