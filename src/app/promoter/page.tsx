import Link from 'next/link';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export const metadata = {
  title: 'Become a Promoter | Banner Beauty',
  description: 'Earn commissions by helping clubs and organizations establish Banner Brigades. Join the Banner Beauty Promoter program.',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '1rem',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: '#C5A028',
  margin: '0 0 12px',
  fontWeight: 700,
};

const h2Style: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
  fontWeight: 700,
  color: '#1B2A4A',
  margin: '0 0 24px',
};

const h2WhiteStyle: React.CSSProperties = {
  ...h2Style,
  color: '#FFFFFF',
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '1rem',
  color: '#444444',
  lineHeight: 1.8,
  margin: '0 0 16px',
};

const bodyWhiteStyle: React.CSSProperties = {
  ...bodyStyle,
  color: 'rgba(255,255,255,0.75)',
};

const sectionLight: React.CSSProperties = { background: '#FAF7F2', padding: '72px 24px' };
const sectionWhite: React.CSSProperties = { background: '#FFFFFF', padding: '72px 24px' };
const sectionDark: React.CSSProperties = { background: '#1B2A4A', padding: '72px 24px' };
const inner: React.CSSProperties = { maxWidth: 760, margin: '0 auto' };

export default async function PromoterPage() {
  const session = await getSession();
  const neighborId = session?.isLoggedIn ? session.neighborId : null;

  // Check if already a promoter
  let promoterStatus: string | null = null;
  if (neighborId) {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_promoters?$filter=_bb_neighbor_value eq '${neighborId}' and statecode eq 0&$select=bb_status&$top=1`
      );
      if (res.value?.length > 0) {
        promoterStatus = res.value[0].bb_status?.toString() ?? null;
      }
    } catch {
      // Non-critical — fall through
    }
  }

  // CTA button logic
  let ctaButton: React.ReactNode;
  if (!session?.isLoggedIn) {
    ctaButton = (
      <Link href="/signin?callbackUrl=/promoter/apply" style={ctaBtnStyle}>
        Apply to Become a Promoter
      </Link>
    );
  } else if (promoterStatus === '121120000') {
    // Pending
    ctaButton = (
      <div style={statusCardStyle}>
        <p style={{ ...statusLabelStyle, color: '#C5A028' }}>⏳ Application Under Review</p>
        <p style={statusSubStyle}>We received your application and will be in touch soon.</p>
      </div>
    );
  } else if (promoterStatus === '121120001') {
    // Active
    ctaButton = (
      <div style={statusCardStyle}>
        <p style={{ ...statusLabelStyle, color: '#1B7A3E' }}>★ You are an Active Promoter</p>
        <Link href="/promoter/dashboard" style={ctaBtnStyle}>View Your Dashboard</Link>
      </div>
    );
  } else if (promoterStatus === '121120002') {
    // Denied
    ctaButton = (
      <div style={statusCardStyle}>
        <p style={{ ...statusLabelStyle, color: '#B22234' }}>Your application was not approved.</p>
        <p style={statusSubStyle}>Please contact admin@bannerbeauty.com if you have questions.</p>
      </div>
    );
  } else {
    // Logged in, not a promoter
    ctaButton = (
      <Link href="/promoter/apply" style={ctaBtnStyle}>
        Apply to Become a Promoter
      </Link>
    );
  }

  return (
    <>
      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C5A028', margin: '0 0 16px', fontWeight: 700 }}>
          ★ Promoter Program ★
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px', lineHeight: 1.25 }}>
          Become a Banner Beauty Promoter
        </h1>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Turn your community connections into a recurring income — while helping America fly her colors.
        </p>
        {ctaButton}
      </section>

      {/* What is a Promoter */}
      <section style={sectionLight}>
        <div style={inner}>
          <p style={eyebrowStyle}>★ What is a Promoter?</p>
          <h2 style={h2Style}>Your Community. Your Income.</h2>
          <p style={bodyStyle}>
            A Banner Beauty Promoter is a community ambassador who introduces clubs, organizations, and civic groups to Banner Beauty and helps them establish their own Banner Brigade — a patriotic home base where members can honor veterans, first responders, and neighbors by gifting American flags together.
          </p>
          <p style={{ ...bodyStyle, margin: 0 }}>
            As a Promoter, you earn a commission every time a member of one of your Brigades sends a Banner Bump — for as long as that Brigade is active. No time limits. No caps. The more your Brigades grow, the more you earn.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={sectionWhite}>
        <div style={inner}>
          <p style={eyebrowStyle}>★ How It Works</p>
          <h2 style={h2Style}>Four Simple Steps</h2>
          {[
            { n: '1', title: 'Apply', body: 'Complete a short application, set up your Stripe payout account, and agree to our Independent Contractor terms. We\'ll review your application and reach out to confirm your first Brigade connection.' },
            { n: '2', title: 'Share Your Referral Link', body: 'Once approved, you\'ll receive a unique referral link tied to your Banner Beauty handle. Share it with any organization you\'re working with — when they create their Brigade using your link, they\'re permanently connected to your account.' },
            { n: '3', title: 'Earn on Every Bump', body: 'Every Banner Bump made through one of your Brigades earns you $1.00. Letter Only, Letter + Flag, Letter + Gift Certificate — every type counts. Every purchase counts.' },
            { n: '4', title: 'Get Paid Monthly', body: 'Commissions are paid on the 1st of every month via Stripe direct deposit. Once your balance reaches $25, it pays out automatically. Balances under $25 roll forward — you never lose what you\'ve earned.' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', gap: 20, marginBottom: 32, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: '#B22234', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#FFFFFF', fontSize: '1.1rem' }}>
                {step.n}
              </div>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B2A4A', margin: '0 0 8px' }}>{step.title}</p>
                <p style={{ ...bodyStyle, margin: 0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Groups */}
      <section style={sectionDark}>
        <div style={inner}>
          <p style={{ ...eyebrowStyle, color: '#C5A028' }}>★ Who Are Your Recruits?</p>
          <h2 style={h2WhiteStyle}>Any Group That Loves America</h2>
          <p style={bodyWhiteStyle}>
            Banner Beauty Brigades work for virtually any organized group that shares a patriotic spirit:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px', marginTop: 8 }}>
            {[
              'VFW Posts', 'American Legion Chapters', 'Elks Lodges', 'Lions Clubs',
              'Rotary Chapters', 'Boy Scout Troops', 'Girl Scout Troops', 'Fire Stations',
              'Police Departments', 'Military Units', 'Veterans Groups', 'Churches & Faith Communities',
              'HOAs', 'Schools & Booster Clubs', 'Biker Clubs', 'Any group that loves America',
            ].map(org => (
              <p key={org} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', margin: '4px 0' }}>
                ★ {org}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Table */}
      <section style={sectionLight}>
        <div style={inner}>
          <p style={eyebrowStyle}>★ What You&apos;ll Earn</p>
          <h2 style={h2Style}>Simple Math. Real Money.</h2>
          <p style={bodyStyle}>
            The math is simple: the bigger and more active your Brigades, the more you earn — indefinitely.
          </p>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#1B2A4A', color: '#FFFFFF' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700 }}>Monthly Bumps Across Your Brigades</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700 }}>Monthly Commission</th>
                </tr>
              </thead>
              <tbody>
                {[['50', '$50'], ['100', '$100'], ['250', '$250'], ['500', '$500'], ['1,000', '$1,000']].map(([bumps, commission], i) => (
                  <tr key={bumps} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F3EFE9' }}>
                    <td style={{ padding: '12px 20px', color: '#333333' }}>{bumps} Bumps</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right', color: '#1B7A3E', fontWeight: 700 }}>{commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...bodyStyle, marginTop: 16, fontSize: '0.85rem', color: '#888888' }}>
            There&apos;s no ceiling. A single active Brigade with engaged members can generate hundreds of Bumps per month. Build a network of Brigades and your commissions compound accordingly.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionWhite}>
        <div style={inner}>
          <p style={eyebrowStyle}>★ Frequently Asked Questions</p>
          <h2 style={h2Style}>Everything You Need to Know</h2>
          {[
            { q: 'Do I need to be a Banner Beauty member to apply?', a: 'Yes — you\'ll need a Banner Beauty account with a complete profile before you can apply. It\'s free to sign up.' },
            { q: 'How does the Brigade get connected to my account?', a: 'When you share your referral link with an organization, any Brigade created through that link is automatically connected to your Promoter account. We\'ll also verify the connection with a quick call to the Brigade\'s Point of Contact.' },
            { q: 'When do commissions start accruing?', a: 'As soon as the Brigade is created through your referral link. We track every Bump from day one — even before verification is complete — so you never lose credit for early activity.' },
            { q: 'What does "verified" mean?', a: 'Before commissions are paid out, we confirm that each Brigade represents a real, independently organized group and that you played a genuine role in its establishment. Verification typically involves a brief call with the Brigade\'s Point of Contact.' },
            { q: 'Can I promote as many Brigades as I want?', a: 'Absolutely. There\'s no limit to the number of Brigades you can onboard.' },
            { q: 'What Bump types qualify for commission?', a: 'All of them — Letter Only, Letter + Flag, and Letter + Gift Certificate. Full-price and Patriot\'s Club purchases all qualify.' },
            { q: 'How do I get paid?', a: 'Via Stripe direct deposit to your bank account or debit card. You\'ll set up your payout method during the application process. Payouts go out automatically on the 1st of each month for any balance of $25 or more.' },
            { q: 'Will I receive a 1099?', a: 'Yes — if you earn $600 or more in a calendar year, Banner Beauty will issue a Form 1099-NEC. As an independent contractor, you are responsible for reporting and paying your own taxes.' },
            { q: 'Can my commission rate change?', a: 'The current rate is $1.00 per qualifying Bump. The rate may be adjusted in the future with 30 days\' written notice. Any Bumps already accrued at the prior rate are unaffected.' },
            { q: 'What if I want to stop being a Promoter?', a: 'You can terminate your participation at any time by emailing admin@bannerbeauty.com. Any verified commissions accrued before your termination date will be paid out on the next regular payout date, provided the $25 minimum is met.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ borderBottom: '1px solid #E8E2D9', paddingBottom: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#1B2A4A', margin: '0 0 8px' }}>{q}</p>
              <p style={{ ...bodyStyle, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C5A028', margin: '0 0 16px', fontWeight: 700 }}>
          ★ Ready to Get Started? ★
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px' }}>
          Build Patriotic Communities. Earn Real Income.
        </h2>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Questions? Reach us at <a href="mailto:admin@bannerbeauty.com" style={{ color: '#C5A028', textDecoration: 'none' }}>admin@bannerbeauty.com</a>
        </p>
        {ctaButton}
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '24px auto 0', maxWidth: 560, lineHeight: 1.6 }}>
          Banner Beauty Promoters are independent contractors, not employees of Banner Beauty, LLC. Participation is subject to approval and the terms of the Banner Beauty Independent Contractor Agreement.
        </p>
      </section>
    </>
  );
}

const ctaBtnStyle: React.CSSProperties = {
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
};

const statusCardStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '16px 28px',
  textAlign: 'center',
};

const statusLabelStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  fontSize: '1rem',
  margin: '0 0 8px',
};

const statusSubStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.65)',
  margin: 0,
};
