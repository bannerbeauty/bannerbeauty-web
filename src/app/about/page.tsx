import Link from 'next/link';

export const metadata = {
  title: 'Our Story | Banner Beauty',
  description: 'Banner Beauty brings neighbors together in patriotic brotherhood, one Banner Bump at a time.',
};

export default function AboutPage() {
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
          ★ Our Story ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
          lineHeight: 1.25,
        }}>
          Building Patriotic Neighborhoods
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 560,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          One neighbor. One flag. One act of kindness at a time.
        </p>
      </section>

      {/* Section 1 — The Idea */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ The Idea
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 24px',
          }}>
            Every Neighborhood Has One
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: '0 0 16px',
          }}>
            A flag that&apos;s been flying through too many storms, faded by too many summers, frayed at the edges but still up there — still flying. The person who put it up loves this country. You can tell. But maybe they don&apos;t know it&apos;s time for a new one, or maybe they just haven&apos;t gotten around to it yet.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: 0,
          }}>
            Banner Beauty was built for that moment. The moment when a neighbor notices, and wants to help.
          </p>
        </div>
      </section>

      {/* Section 2 — What We Do */}
      <section style={{ background: '#FFFFFF', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ What We Do
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 24px',
          }}>
            The Banner Bump
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: '0 0 16px',
          }}>
            You spot a tattered flag in your neighborhood, you come to Banner Beauty, and you send that neighbor a heartfelt letter, a gift certificate for a new flag, or a brand new American flag delivered straight to their door — anonymously if you prefer, or with your name proudly attached.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: 0,
          }}>
            No drama. No judgment. Just one American looking out for another. That&apos;s how patriotic communities are built — one neighbor, one flag, one act of kindness at a time.
          </p>
        </div>
      </section>

      {/* Section 3 — Brotherhood */}
      <section style={{ background: '#1B2A4A', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ Brotherhood and Community
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 24px',
          }}>
            More Than a Service
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.8,
            margin: '0 0 16px',
          }}>
            Banner Beauty is more than a service — it&apos;s a movement. Every Banner Bump is a thread in the fabric of a community, a quiet act of brotherhood that says: I see you, I appreciate you, and I&apos;m glad you&apos;re my neighbor.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.8,
            margin: 0,
          }}>
            When Americans look out for one another in small, meaningful ways, something powerful happens. Neighborhoods become communities. Strangers become neighbors. And the flag flying on the corner means a little bit more to everyone who passes it.
          </p>
        </div>
      </section>

      {/* Section 4 — Honor and Memory */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ Honor and Memory
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 24px',
          }}>
            A Living Tribute
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: '0 0 16px',
          }}>
            A Banner Bump is also a deeply personal way to honor someone you love. Dedicate a flag or gift certificate in memory of a veteran, a parent, a friend — someone whose patriotism inspired you. Their name will appear in your letter to the recipient, turning a simple act of generosity into a living tribute.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: 0,
          }}>
            It&apos;s a gift that flies in the breeze long after it&apos;s given.
          </p>
        </div>
      </section>

      {/* Section 5 — Why Now */}
      <section style={{ background: '#FFFFFF', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ Why Now
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 24px',
          }}>
            America&apos;s 250th Birthday
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: 0,
          }}>
            America is celebrating her 250th birthday on July 4th, 2026. Two and a half centuries of the flag flying over this country — through wars, through hardship, through triumph. There has never been a better moment to make sure Old Glory is flying with the dignity she deserves in every neighborhood across America.
          </p>
        </div>
      </section>

      {/* Section 6 — Built in California */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px',
          }}>
            ★ Built in California
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 24px',
          }}>
            Small Company, Big Mission
          </h2>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: '0 0 16px',
          }}>
            Banner Beauty is a small, independent company founded on California&apos;s Central Coast. We built this platform because we believe patriotism isn&apos;t a political statement — it&apos;s a neighborly one. It&apos;s the quiet pride of someone who hangs a flag on their porch every morning. It&apos;s the community that looks out for each other.
          </p>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1rem',
            color: '#444444',
            lineHeight: 1.8,
            margin: 0,
          }}>
            We&apos;re honored to help build patriotic neighborhoods, one Banner Bump at a time.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          margin: '0 0 16px',
        }}>
          ★ Ready to Make a Difference? ★
        </p>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 32px',
        }}>
          Banner Bump a Fellow Patriot
        </h2>
        <Link
          href="/submit-banner"
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
          ★ Get Started
        </Link>
      </section>
    </>
  );
}
