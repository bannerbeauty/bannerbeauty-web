import Link from 'next/link';
import Image from 'next/image';

const colHeaderStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#C5A028',
  marginBottom: 16,
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.65)',
  textDecoration: 'none',
  marginBottom: 10,
  lineHeight: 1.4,
};

export default function Footer() {
  return (
    <footer style={{ background: '#1B2A4A' }}>
      {/* Main columns */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '56px 24px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '40px 32px',
        alignItems: 'start',
      }}>

        {/* Col 1: Logo + tagline */}
        <div>
          <Image
            src="https://bannerbeautystorage.blob.core.windows.net/logos/bannerbeauty-wordmark-logo-horizontal-white-banner.png"
            alt="BannerBeauty"
            width={240}
            height={80}
            style={{ height: 80, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: 16 }}
            unoptimized
          />
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.88rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Honoring neighbors who fly the American flag with pride — one banner at a time.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <p style={colHeaderStyle}>Quick Links</p>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/submit-banner" style={linkStyle}>Banner Bump</Link>
          <Link href="/store" style={linkStyle}>Shop Our Store</Link>
          <Link href="/about" style={linkStyle}>About Us</Link>
        </div>

        {/* Col 3: Support */}
        <div>
          <p style={colHeaderStyle}>Support</p>
          <Link href="/faq" style={linkStyle}>FAQ</Link>
          <Link href="/support" style={linkStyle}>Contact Us</Link>
          <Link href="/track" style={linkStyle}>Track My Order</Link>
        </div>

        {/* Col 4: Legal */}
        <div>
          <p style={colHeaderStyle}>Legal</p>
          <Link href="/privacy-policy" style={linkStyle}>Privacy Policy</Link>
          <Link href="/terms" style={linkStyle}>Terms of Use</Link>
          <Link href="/copyright" style={linkStyle}>Copyright</Link>
        </div>

        {/* Col 5: Contact */}
        <div>
          <p style={colHeaderStyle}>Contact</p>
          <a href="mailto:hello@bannerbeauty.com" style={linkStyle}>
            hello@bannerbeauty.com
          </a>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
            margin: 0,
          }}>
            © 2026 BannerBeauty. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
            margin: 0,
            letterSpacing: '0.5px',
          }}>
            Building Patriotic Neighborhoods — One Banner at a Time ★
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          footer > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
          footer > div:first-child > div:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </footer>
  );
}
