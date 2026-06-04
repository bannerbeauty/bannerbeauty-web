import Link from 'next/link';

const COL_ONE = [
  { label: 'Home', href: '/' },
  { label: 'Banner Bump', href: '/submit-banner' },
  { label: 'Store', href: '/store' },
  { label: 'Profile', href: '/profile' },
];

const COL_TWO = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer style={{ background: '#1B2A4A', marginTop: 'auto' }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '48px 24px 32px',
        textAlign: 'center',
      }}>
        {/* Tagline */}
        <p style={{
          color: '#C5A028',
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.75rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 20px 0',
        }}>
          Building Patriotic Neighborhoods
        </p>

        {/* Gold star separator */}
        <div style={{
          color: '#C5A028',
          fontSize: '0.9rem',
          letterSpacing: '12px',
          margin: '0 0 28px 0',
        }}>
          ★ ★ ★
        </div>

        {/* Nav links — two columns desktop, stacked mobile */}
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px 64px',
          flexWrap: 'wrap',
          margin: '0 0 32px 0',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            {COL_ONE.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            {COL_TWO.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            margin: 0,
          }}>
            © 2026 BannerBeauty LLC · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
