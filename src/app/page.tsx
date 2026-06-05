import Link from 'next/link';
import Image from 'next/image';
import { dataverse } from '@/lib/dataverse';
import HomeClient, { type FeaturedBanner, type Quote } from './HomeClient';

// ── Dataverse types ────────────────────────────────────────────────────────────

interface DvFeaturedBanner {
  bb_bannerid: string;
  createdon?: string;
  bb_attributiontype?: string;
  bb_attributionname?: string;
  bb_attributiontext?: string;
  bb_notein?: string;
  bb_notern?: string;
  bb_beforephotourl?: string;
  bb_afterphotourl?: string;
  bb_sharename?: boolean;
  bb_infirstname?: string;
  bb_rnfirstname?: string;
  bb_recipientcity?: string;
  bb_recipientstate?: string;
}

interface DvPublicNotesBanner {
  bb_notein?: string;
  bb_notern?: string;
  bb_ispublicnotern?: boolean;
  bb_sharename?: boolean;
  bb_infirstname?: string;
  bb_rnfirstname?: string;
}

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function getBannerCount(): Promise<number> {
  const result = await dataverse.get<{ '@odata.count': number }>(
    'bb_banners?$count=true&$select=bb_bannerid'
  );
  return result['@odata.count'] ?? 0;
}

async function getFeaturedBanners(): Promise<DvFeaturedBanner[]> {
  const result = await dataverse.get<{ value: DvFeaturedBanner[] }>(
    'bb_banners?$filter=bb_isfeatureable eq true and statecode eq 0' +
    '&$select=bb_bannerid,createdon,bb_attributiontype,bb_attributionname,bb_attributiontext,bb_notein,bb_notern,bb_beforephotourl,bb_afterphotourl,bb_sharename,bb_infirstname,bb_rnfirstname,bb_recipientcity,bb_recipientstate'
  );
  return result.value ?? [];
}

async function getBannerLocations() {
  try {
    const result = await dataverse.get<{ value: { bb_latitude: number; bb_longitude: number }[] }>(
      'bb_banners?$filter=statecode eq 0 and bb_latitude ne null and bb_longitude ne null&$select=bb_latitude,bb_longitude'
    );
    return result.value ?? [];
  } catch {
    return [];
  }
}

async function getPublicNotesBanners(): Promise<DvPublicNotesBanner[]> {
  const result = await dataverse.get<{ value: DvPublicNotesBanner[] }>(
    'bb_banners?$filter=(bb_ispublicnotern eq true or bb_notein ne null) and statecode eq 0' +
    '&$select=bb_notein,bb_notern,bb_ispublicnotern,bb_sharename,bb_infirstname,bb_rnfirstname'
  );
  return result.value ?? [];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatsSection({ count }: { count: number }) {
  return (
    <section style={{ background: '#1B2A4A', padding: '72px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1.125rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          margin: '0 0 24px 0',
        }}>
          ★ Bumping It Forward ★
        </p>
        <div style={{
          color: '#C5A028',
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2.8rem, 8vw, 4.8rem)',
          fontWeight: 700,
          lineHeight: 1.2,
        }}>
          ★ Bump Count: {count.toLocaleString()} ★
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1.76rem',
          marginTop: 16,
          marginBottom: 0,
          lineHeight: 1.5,
        }}>
          ... nationwide!<br />Let&apos;s build patriotic communities!
        </p>
      </div>
    </section>
  );
}

const OPTION_CARDS = [
  {
    emoji: '✉️',
    title: 'Send a Letter',
    description: 'A heartfelt letter delivered by mail to honor a fellow patriot.',
    price: '$5.99',
  },
  {
    emoji: '🎁',
    title: 'Send a Gift Certificate',
    description: 'Let them choose their own flag from the BannerBeauty store.',
    price: 'From $25',
  },
  {
    emoji: '🇺🇸',
    title: 'Send a Flag',
    description: 'A brand new American flag delivered straight to their door.',
    price: 'From $30',
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [countRes, featuredRes, notesRes, locationsRes] = await Promise.allSettled([
    getBannerCount(),
    getFeaturedBanners(),
    getPublicNotesBanners(),
    getBannerLocations(),
  ]);

  if (countRes.status === 'rejected') console.error('Banner count fetch failed:', countRes.reason);
  if (featuredRes.status === 'rejected') console.error('Featured banners fetch failed:', featuredRes.reason);
  if (notesRes.status === 'rejected') console.error('Public notes fetch failed:', notesRes.reason);
  if (locationsRes.status === 'rejected') console.error('Banner locations fetch failed:', locationsRes.reason);

  const count = countRes.status === 'fulfilled' ? countRes.value : 0;
  const featuredBanners = featuredRes.status === 'fulfilled' ? featuredRes.value : [];
  const notesBanners = notesRes.status === 'fulfilled' ? notesRes.value : [];
  const locations = locationsRes.status === 'fulfilled' ? locationsRes.value : [];

  // Day-indexed featured banner (Pacific time)
  const pacificOffsetMs = (() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(new Date());
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT-8';
    const hoursFromUtc = parseInt(tzName.replace('GMT', '')) || -8;
    return -hoursFromUtc * 3600 * 1000;
  })();
  const dayIndex = Math.floor((Date.now() - pacificOffsetMs) / 86400000);

  const dvFeatured = featuredBanners.length > 0
    ? featuredBanners[dayIndex % featuredBanners.length]
    : null;

  const featuredBanner: FeaturedBanner | null = dvFeatured
    ? {
        bannerId: dvFeatured.bb_bannerid,
        attributionType: dvFeatured.bb_attributiontype ?? '',
        attributionName: dvFeatured.bb_attributionname ?? '',
        attributionText: dvFeatured.bb_attributiontext ?? '',
        noteIn: dvFeatured.bb_notein ?? '',
        noteRn: dvFeatured.bb_notern ?? '',
        beforePhotoUrl: dvFeatured.bb_beforephotourl ?? null,
        afterPhotoUrl: dvFeatured.bb_afterphotourl ?? null,
        initiatingFirstName: dvFeatured.bb_infirstname ?? '',
        recipientFirstName: dvFeatured.bb_rnfirstname ?? '',
        recipientCity: dvFeatured.bb_recipientcity ?? '',
        recipientState: dvFeatured.bb_recipientstate ?? '',
        shareName: dvFeatured.bb_sharename ?? false,
      }
    : null;

  // Build quotes using denormalized name fields
  const quotes: Quote[] = [];
  for (const b of notesBanners) {
    if (b.bb_notein) {
      quotes.push({
        quote: b.bb_notein,
        name: b.bb_sharename ? (b.bb_infirstname || 'A Fellow Patriot') : 'A Fellow Patriot',
        type: 'in',
      });
    }
    if (b.bb_notern && b.bb_ispublicnotern) {
      quotes.push({
        quote: b.bb_notern,
        name: b.bb_rnfirstname || 'A Grateful Patriot',
        type: 'rn',
      });
    }
  }

  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        background: '#1B2A4A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <Image
          src="https://bannerbeautystorage.blob.core.windows.net/images/hero-home.png"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.18 }}
          priority
          unoptimized
        />

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '64px 24px',
          maxWidth: 760,
          margin: '0 auto',
        }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 20px 0',
            lineHeight: 1.25,
          }}>
            Building Patriotic Neighborhoods
          </h1>

          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            margin: '0 auto 40px',
            maxWidth: 560,
          }}>
            See a tattered flag out there? Help a fellow patriot with a letter, gift certificate, or brand new flag.
          </p>

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
            ★ Banner Bump a Fellow Patriot
          </Link>
        </div>
      </section>

      {/* Three Ways */}
      <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1.125rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}>
            How It Works
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            textAlign: 'center',
            margin: '0 0 48px 0',
          }}>
            3 Ways to Banner Bump
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {OPTION_CARDS.map((card) => (
              <div key={card.title} style={{
                border: '2px solid #1B2A4A',
                borderRadius: 8,
                padding: '36px 28px',
                textAlign: 'center',
                background: '#FAF7F2',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#FFFFFF',
                  padding: '0 12px',
                  color: '#C5A028',
                  fontSize: '1.1rem',
                }}>
                  ★
                </div>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>{card.emoji}</div>
                <h3 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#1B2A4A',
                  margin: '0 0 12px 0',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.9rem',
                  color: '#666666',
                  lineHeight: 1.6,
                  margin: '0 0 20px 0',
                }}>
                  {card.description}
                </p>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#B22234',
                }}>
                  {card.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/submit-banner" style={{
              display: 'inline-block',
              background: '#1B2A4A',
              color: '#FFFFFF',
              fontFamily: 'Georgia, serif',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '14px 36px',
              borderRadius: 4,
              textDecoration: 'none',
            }}>
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection count={count} />

      {/* Video */}
      <section style={{ background: '#FAF7F2', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1.125rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 12px 0',
          }}>
            See It In Action
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2.8rem, 6vw, 4rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 32px 0',
          }}>
            What is a Banner Bump?
          </h2>
          <div style={{
            background: '#1B2A4A',
            borderRadius: 8,
            aspectRatio: '16 / 9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            color: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontSize: '4rem', opacity: 0.4 }}>▶</div>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Video coming soon
            </p>
          </div>
        </div>
      </section>

      {/* Featured Banner + Quotes — client-rendered */}
      <HomeClient featuredBanner={featuredBanner} quotes={quotes} locations={locations} />
    </>
  );
}
