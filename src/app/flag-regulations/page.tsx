export const metadata = {
  title: 'U.S. Flag Regulations | Banner Beauty',
  description: 'Official U.S. Flag Code rules and guidelines for displaying, caring for, and retiring the American flag.',
};

const sections = [
  {
    icon: '🕐',
    title: 'When to Fly Your Flag',
    rules: [
      'Display the flag from sunrise to sunset on buildings and stationary flagstaffs.',
      'The flag may be displayed 24 hours a day if properly illuminated during darkness.',
      'Take the flag down during storms unless it is an all-weather flag.',
      'The flag should be displayed on all national and state holidays, and on days proclaimed by the President.',
      'Display the flag near every polling place on election days and at schoolhouses during school days.',
    ],
  },
  {
    icon: '🏠',
    title: 'Displaying on Your Home',
    rules: [
      'When displayed from a staff projecting from a window or porch, the union (blue field) should be at the peak of the staff.',
      'When displayed flat against a wall horizontally, the union should be uppermost and to the flag\'s own right (observer\'s left).',
      'When displayed vertically, the union should be uppermost and to the flag\'s own right (observer\'s left).',
      'The flag should never touch the ground, floor, or water beneath it.',
      'The flag should never be fastened or stored in a way that permits it to be torn, soiled, or damaged.',
    ],
  },
  {
    icon: '🚗',
    title: 'Flags on Vehicles',
    rules: [
      'The flag should not be draped over the hood, top, sides, or back of any vehicle.',
      'When displayed on a vehicle, the staff must be firmly fixed to the chassis or clamped to the right fender.',
      'The flag should never be carried flat or horizontally — always aloft and free.',
    ],
  },
  {
    icon: '🎖️',
    title: 'Respect for the Flag',
    rules: [
      'The flag should never be displayed with the union (stars) down, except as a signal of dire distress.',
      'The flag should never be used as wearing apparel, bedding, or drapery.',
      'The flag should never be used as a covering for a ceiling.',
      'The flag should never have any mark, insignia, letter, word, figure, design, or picture placed on it.',
      'The flag should never be used for advertising purposes in any manner whatsoever.',
      'The flag should never be used as a receptacle for carrying or delivering anything.',
      'The flag should never be dipped to any person or thing. It dips to no earthly king.',
    ],
  },
  {
    icon: '🪖',
    title: 'During the Pledge & National Anthem',
    rules: [
      'During the Pledge of Allegiance, civilians should stand at attention facing the flag with the right hand over the heart.',
      'During the National Anthem, those present should stand at attention facing the flag.',
      'Military personnel in uniform should render the military salute.',
      'When the flag is passing in a parade, stand at attention and place your right hand over your heart.',
    ],
  },
  {
    icon: '🔥',
    title: 'Retiring a Worn Flag',
    rules: [
      'When a flag is worn, tattered, or faded, it should be retired with dignity.',
      'The preferred method of retirement is burning in a dignified ceremony.',
      'Many American Legion and VFW posts conduct free flag retirement ceremonies.',
      'Never simply throw a worn flag in the trash.',
      'Contact your local American Legion, VFW, or Boy Scout troop to find a retirement ceremony near you.',
    ],
  },
];

export default function FlagRegulationsPage() {
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
          ★ Honor Old Glory ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          U.S. Flag Regulations
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 560,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          The United States Flag Code (4 U.S.C. § 1 et seq.) establishes rules and customs
          for the display and care of the American flag. Here&apos;s what every patriot should know.
        </p>
      </section>

      {/* Sections */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {sections.map((section) => (
              <div
                key={section.title}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: '1px solid #EEEEEE',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(27,42,74,0.06)',
                }}
              >
                {/* Section header */}
                <div style={{
                  background: '#1B2A4A',
                  padding: '20px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>
                  <h2 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                  }}>
                    {section.title}
                  </h2>
                </div>

                {/* Rules */}
                <ul style={{ margin: 0, padding: '20px 28px 24px 48px' }}>
                  {section.rules.map((rule, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'Trebuchet MS, sans-serif',
                        fontSize: '0.95rem',
                        color: '#333333',
                        lineHeight: 1.7,
                        marginBottom: i < section.rules.length - 1 ? 10 : 0,
                      }}
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 48,
            padding: '24px 28px',
            background: 'rgba(197,160,40,0.08)',
            border: '1px solid rgba(197,160,40,0.3)',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              color: '#666666',
              margin: '0 0 8px',
              lineHeight: 1.7,
            }}>
              The U.S. Flag Code provides advisory guidelines &mdash; violations carry no criminal penalty for civilians.
              The code reflects long-standing traditions of honor and respect for our nation&apos;s symbol.
            </p>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              color: '#666666',
              margin: 0,
            }}>
              Source: <a href="https://uscode.house.gov/view.xhtml?path=%2Fprelim%40title4%2Fchapter1&edition=prelim" target="_blank" rel="noopener noreferrer" style={{ color: '#B22234' }}>United States Code, Title 4, Chapter 1</a>
            </p>
          </div>

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
          ★ See a Tattered Flag? ★
        </p>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Help a Fellow Patriot
        </h2>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 32px',
          lineHeight: 1.7,
        }}>
          Send them a letter, gift certificate, or brand new flag through Banner Beauty.
        </p>
        <a
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
          ★ Banner Bump a Fellow Patriot
        </a>
      </section>
    </>
  );
}
