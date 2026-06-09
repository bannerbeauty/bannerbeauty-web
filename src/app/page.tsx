import Link from 'next/link';
import Image from 'next/image';
import { dataverse } from '@/lib/dataverse';
import HomeClient, { type FeaturedBanner, type Quote, type Dedication } from './HomeClient';

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
  bb_ispublicnotein?: boolean;
  bb_sharename?: boolean;
  bb_infirstname?: string;
  bb_rnfirstname?: string;
  bb_recipientcity?: string;
  bb_recipientstate?: string;
  bb_InitiatingNeighbor?: { bb_city?: string; bb_state?: string };
  bb_RecipientNeighbor?: { bb_city?: string; bb_state?: string };
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
    'bb_banners?$filter=bb_isfeatureable eq true and statuscode ne 121120002' +
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

async function getBannerTotals(): Promise<Record<string, number>> {
  try {
    const result = await dataverse.get<{ value: { bb_statename: string; bb_statenamefull: string; bb_count: number }[] }>(
      'bb_bannertotals?$select=bb_statename,bb_statenamefull,bb_count&$orderby=bb_statename asc'
    );
    const map: Record<string, number> = {};
    for (const row of result.value ?? []) {
      map[row.bb_statenamefull] = row.bb_count ?? 0;
    }
    return map;
  } catch {
    return {};
  }
}

async function getProductPrices(): Promise<{ letterPrice: number; cheapestFlag: number; cheapestGC: number }> {
  try {
    const result = await dataverse.get<{ value: { bb_price: number; bb_producttype: number }[] }>(
      'bb_products?$filter=statecode eq 0 and bb_displayinstore eq true and (bb_producttype eq 121120000 or bb_producttype eq 121120004 or bb_producttype eq 121120005)&$select=bb_price,bb_producttype'
    );
    const products = result.value ?? [];
    const flags = products.filter(p => p.bb_producttype === 121120000).map(p => p.bb_price);
    const gcs = products.filter(p => p.bb_producttype === 121120004).map(p => p.bb_price);
    const letters = products.filter(p => p.bb_producttype === 121120005).map(p => p.bb_price);
    return {
      letterPrice: letters.length > 0 ? Math.min(...letters) : 5.99,
      cheapestFlag: flags.length > 0 ? Math.min(...flags) : 30,
      cheapestGC: gcs.length > 0 ? Math.min(...gcs) : 25,
    };
  } catch {
    return { letterPrice: 5.99, cheapestFlag: 30, cheapestGC: 25 };
  }
}

async function getPublicNotesBanners(): Promise<DvPublicNotesBanner[]> {
  try {
    const [rnRes, inRes] = await Promise.all([
      dataverse.get<{ value: DvPublicNotesBanner[] }>(
        'bb_banners?$filter=bb_isfeatureable eq true and bb_ispublicnotern eq true and statuscode ne 121120002' +
        '&$select=bb_notein,bb_notern,bb_ispublicnotern,bb_sharename,bb_infirstname,bb_rnfirstname,bb_recipientcity,bb_recipientstate' +
        '&$expand=bb_InitiatingNeighbor($select=bb_city,bb_state),bb_RecipientNeighbor($select=bb_city,bb_state)'
      ),
      dataverse.get<{ value: DvPublicNotesBanner[] }>(
        'bb_banners?$filter=bb_isfeatureable eq true and bb_ispublicnotein eq true and statuscode ne 121120002' +
        '&$select=bb_notein,bb_notern,bb_ispublicnotern,bb_sharename,bb_infirstname,bb_rnfirstname,bb_recipientcity,bb_recipientstate' +
        '&$expand=bb_InitiatingNeighbor($select=bb_city,bb_state),bb_RecipientNeighbor($select=bb_city,bb_state)'
      ),
    ]);
    console.log('RN notes count:', rnRes.value?.length ?? 0);
    console.log('IN notes count:', inRes.value?.length ?? 0);
    console.log('RN sample:', JSON.stringify(rnRes.value?.[0]));
    return [...(rnRes.value ?? []), ...(inRes.value ?? [])];
  } catch (err) {
    console.error('getPublicNotesBanners failed:', err);
    return [];
  }
}

interface DvDedication {
  bb_bannerid: string;
  bb_attributiontype?: number;
  bb_attributionname?: string;
  bb_attributiontext?: string;
  bb_banneroption?: number;
  bb_sharename?: boolean;
  bb_infirstname?: string;
  bb_recipientcity?: string;
  bb_recipientstate?: string;
}

async function getDedications(): Promise<DvDedication[]> {
  try {
    const result = await dataverse.get<{ value: DvDedication[] }>(
      'bb_banners?$filter=bb_isfeatureable eq true and bb_ispublicattribution eq true and bb_attributiontext ne null and bb_attributionname ne null and statuscode ne 121120002' +
      '&$select=bb_bannerid,bb_attributiontype,bb_attributionname,bb_attributiontext,bb_banneroption,bb_sharename,bb_infirstname,bb_recipientcity,bb_recipientstate'
    );
    console.log('Dedications count:', result.value?.length ?? 0);
    console.log('Dedication sample:', JSON.stringify(result.value?.[0]));
    return result.value ?? [];
  } catch {
    return [];
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────


// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [countRes, featuredRes, notesRes, locationsRes, totalsRes, pricesRes, dedicationsRes] = await Promise.allSettled([
    getBannerCount(),
    getFeaturedBanners(),
    getPublicNotesBanners(),
    getBannerLocations(),
    getBannerTotals(),
    getProductPrices(),
    getDedications(),
  ]);

  if (countRes.status === 'rejected') console.error('Banner count fetch failed:', countRes.reason);
  if (featuredRes.status === 'rejected') console.error('Featured banners fetch failed:', featuredRes.reason);
  if (notesRes.status === 'rejected') console.error('Public notes fetch failed:', notesRes.reason);
  if (locationsRes.status === 'rejected') console.error('Banner locations fetch failed:', locationsRes.reason);
  if (totalsRes.status === 'rejected') console.error('Banner totals fetch failed:', totalsRes.reason);
  if (pricesRes.status === 'rejected') console.error('Product prices fetch failed:', pricesRes.reason);
  if (dedicationsRes.status === 'rejected') console.error('Dedications fetch failed:', dedicationsRes.reason);

  const count = countRes.status === 'fulfilled' ? countRes.value : 0;
  const featuredBanners = featuredRes.status === 'fulfilled' ? featuredRes.value : [];
  const notesBanners = notesRes.status === 'fulfilled' ? notesRes.value : [];
  const locations = locationsRes.status === 'fulfilled' ? locationsRes.value : [];
  const stateTotals = totalsRes.status === 'fulfilled' ? totalsRes.value : {};
  const { letterPrice, cheapestFlag, cheapestGC } = pricesRes.status === 'fulfilled' ? pricesRes.value : { letterPrice: 5.99, cheapestFlag: 30, cheapestGC: 25 };
  const dedications = dedicationsRes.status === 'fulfilled' ? dedicationsRes.value : [];

  const OPTION_CARDS = [
    {
      emoji: '✉️',
      title: 'Send a Letter',
      description: 'A heartfelt patriotic letter delivered by mail to honor a fellow patriot.',
      price: `$${letterPrice.toFixed(2)}`,
      option: '121120000',
    },
    {
      emoji: '🎁',
      title: 'Letter + Gift Certificate',
      description: 'A letter plus a gift certificate so they can pick their own flag.',
      price: `From $${(letterPrice + cheapestGC).toFixed(2)}`,
      option: '121120001',
    },
    {
      emoji: '🇺🇸',
      title: 'Letter + Flag',
      description: 'A brand new flag delivered straight to their door, with a letter.',
      price: `From $${(letterPrice + cheapestFlag).toFixed(2)}`,
      option: '121120002',
    },
  ];

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

  const dvDedication = dedications.length > 0 ? dedications[dayIndex % dedications.length] : null;
  const dedication: Dedication | null = dvDedication ? {
    bannerId: dvDedication.bb_bannerid,
    attributionType: dvDedication.bb_attributiontype,
    attributionName: dvDedication.bb_attributionname,
    attributionText: dvDedication.bb_attributiontext,
    bannerOption: dvDedication.bb_banneroption,
    shareName: dvDedication.bb_sharename,
    initiatingFirstName: dvDedication.bb_infirstname,
    recipientCity: dvDedication.bb_recipientcity,
    recipientState: dvDedication.bb_recipientstate,
  } : null;

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
    if (b.bb_notein && b.bb_ispublicnotein !== false) {
      quotes.push({
        quote: b.bb_notein,
        name: b.bb_sharename ? (b.bb_infirstname || 'A Fellow Patriot') : 'A Fellow Patriot',
        type: 'in',
        city: b.bb_InitiatingNeighbor?.bb_city,
        state: b.bb_InitiatingNeighbor?.bb_state,
      });
    }
    if (b.bb_notern && b.bb_ispublicnotern) {
      quotes.push({
        quote: b.bb_notern,
        name: b.bb_rnfirstname || 'A Grateful Patriot',
        type: 'rn',
        city: b.bb_recipientcity,
        state: b.bb_recipientstate,
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
            See a tattered flag out there?<br/>Help a fellow patriot with<br/>a letter, gift certificate, or brand new flag.
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
              <Link
                key={card.title}
                href={`/submit-banner?option=${card.option}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
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
              </Link>
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
            borderRadius: 8,
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            position: 'relative',
          }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/1w3plWa3XaU"
              title="What is a Banner Bump?"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Featured Banner + Quotes — client-rendered */}
      <HomeClient featuredBanner={featuredBanner} quotes={quotes} locations={locations.map(l => ({ lat: l.bb_latitude, lng: l.bb_longitude }))} stateTotals={stateTotals} totalCount={count} dedication={dedication} />
    </>
  );
}
