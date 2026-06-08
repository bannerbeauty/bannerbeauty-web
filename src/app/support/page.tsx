import Link from 'next/link';

const FAQS: { q: string; a: string }[] = [
  // Placeholder — to be filled in
];

export default function SupportPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          margin: '0 0 16px',
        }}>
          ★ We&apos;re Here to Help ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Support Center
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
        }}>
          Have a question? We&apos;d love to help.
        </p>
      </section>

      {/* Contact */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 16px',
          }}>
            Contact Us
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#555555',
            lineHeight: 1.7,
            margin: '0 0 32px',
          }}>
            Our team typically responds within one business day. We&apos;re happy to help with orders, billing, account questions, or anything else.
          </p>
          <a
            href="mailto:support@bannerbeauty.com"
            style={{
              display: 'inline-block',
              background: '#B22234',
              color: '#FFFFFF',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '16px 40px',
              borderRadius: 4,
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            ✉ Email Support
          </a>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.88rem',
            color: '#888888',
            margin: '16px 0 0',
          }}>
            support@bannerbeauty.com
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#FFFFFF', padding: '72px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ Frequently Asked Questions ★
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 16px',
          }}>
            Got Questions?
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#555555',
            lineHeight: 1.7,
            margin: '0 0 32px',
          }}>
            Browse our FAQ for quick answers to the most common questions about Banner Bumps, gift certificates, shipping, and more.
          </p>
          <Link
            href="/faq"
            style={{
              display: 'inline-block',
              background: '#1B2A4A',
              color: '#FFFFFF',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '16px 40px',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            Browse our FAQ →
          </Link>
        </div>
      </section>
    </>
  );
}
