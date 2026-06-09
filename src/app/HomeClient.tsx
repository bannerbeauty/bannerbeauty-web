'use client';

import { useState, useEffect } from 'react';
import BannerBumpMap from '@/components/BannerBumpMap';

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia'
};

export interface FeaturedBanner {
  bannerId: string;
  attributionType: string;
  attributionName: string;
  attributionText: string;
  noteIn: string;
  noteRn: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  initiatingFirstName: string;
  recipientFirstName: string;
  recipientCity: string;
  recipientState: string;
  shareName: boolean;
}

export interface Quote {
  quote: string;
  name: string;
  type: 'in' | 'rn';
  city?: string;
  state?: string;
}

export interface BannerLocation {
  lat: number;
  lng: number;
}

export interface Dedication {
  bannerId: string;
  attributionType?: number;
  attributionName?: string;
  attributionText?: string;
  bannerOption?: number;
  shareName?: boolean;
  initiatingFirstName?: string;
  recipientCity?: string;
  recipientState?: string;
}

interface HomeClientProps {
  featuredBanner: FeaturedBanner | null;
  quotes: Quote[];
  locations: BannerLocation[];
  stateTotals: Record<string, number>;
  totalCount: number;
  dedication: Dedication | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function HomeClient({ featuredBanner, quotes, locations, stateTotals, totalCount, dedication }: HomeClientProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % quotes.length);
        setVisible(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[quoteIndex];
  const today = formatDate(new Date());

  const senderName = featuredBanner?.shareName && featuredBanner.initiatingFirstName
    ? featuredBanner.initiatingFirstName
    : 'A Fellow Patriot';

  const isHonor = featuredBanner?.attributionType === 'in_honor';
  const isMemoriam = featuredBanner?.attributionType === 'in_memoriam';
  const hasDedication = (isHonor || isMemoriam) && featuredBanner?.attributionName;

  return (
    <>
      {/* ── Banner Bump Map ─────────────────────────────────────────────────── */}
      <BannerBumpMap locations={locations} stateTotals={stateTotals} totalCount={totalCount} />

      {/* ── Dedications ────────────────────────────────────────────────────── */}
      {dedication && (
        <section style={{ background: '#FFFFFF', padding: '72px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '1rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#C5A028',
              margin: '0 0 12px',
            }}>
              ★ Dedications ★
            </p>
            <div style={{
              maxWidth: 600,
              margin: '0 auto',
              background: '#1B2A4A',
              borderRadius: 8,
              padding: '40px 48px',
              borderTop: '4px solid #C5A028',
              borderBottom: '4px solid #C5A028',
            }}>
              <div style={{
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#C5A028',
                marginBottom: 16,
              }}>
                {dedication.attributionType === 121120001 ? 'In Memory Of' : 'In Honor Of'}
              </div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 12,
              }}>
                {dedication.attributionName}
              </div>
              <div style={{
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.88rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 28,
                letterSpacing: '0.5px',
              }}>
                A flag flies in {dedication.recipientCity}, {STATE_NAMES[dedication.recipientState ?? ''] ?? dedication.recipientState}.
              </div>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.8,
                fontStyle: 'italic',
                margin: 0,
              }}>
                &ldquo;{dedication.attributionText}&rdquo;
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Banner ─────────────────────────────────────────────────── */}
      {featuredBanner && (
        <section style={{ background: '#F4F1EC', padding: '72px 24px' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>

            {/* Section label */}
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1.08rem',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: '#C5A028', textAlign: 'center', margin: '0 0 10px',
            }}>
              ★ Featured Banner Bump ★
            </p>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1.6rem',
              color: '#999', textAlign: 'center', margin: '0 0 4px', letterSpacing: '0.5px',
            }}>
              {today}
            </p>
            {(featuredBanner.recipientCity || featuredBanner.recipientState) && (
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1.6rem',
                color: '#999', textAlign: 'center', margin: '0 0 36px', letterSpacing: '0.5px',
              }}>
                {[featuredBanner.recipientCity, featuredBanner.recipientState].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Card */}
            <div style={{
              background: '#1B2A4A', borderRadius: 10,
              overflow: 'hidden', boxShadow: '0 8px 32px rgba(27,42,74,0.18)',
            }}>

              {/* Card header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(197,160,40,0.25)',
              }}>
                <p style={{
                  fontFamily: 'Georgia, serif', fontSize: '1.25rem',
                  color: '#FFFFFF', margin: 0,
                }}>
                  <span style={{ color: '#C5A028', fontWeight: 700 }}>{senderName}</span>
                  {' bumped '}
                  <span style={{ color: '#C5A028', fontWeight: 700 }}>
                    {featuredBanner.recipientFirstName || 'a Patriot'}
                  </span>
                </p>

                {/* Dedication */}
                {hasDedication && (
                  <p style={{
                    fontFamily: 'Georgia, serif', fontSize: '0.95rem',
                    color: '#C5A028', fontStyle: 'italic',
                    margin: '12px 0 0', lineHeight: 1.6,
                  }}>
                    {isHonor ? 'In Honor of' : 'In Memoriam of'} {featuredBanner.attributionName}
                    {featuredBanner.attributionText && (
                      <> — {featuredBanner.attributionText}</>
                    )}
                  </p>
                )}
              </div>

              {/* Photos */}
              {(featuredBanner.beforePhotoUrl || featuredBanner.afterPhotoUrl) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: featuredBanner.beforePhotoUrl && featuredBanner.afterPhotoUrl ? '1fr 1fr' : '1fr',
                  gap: 2,
                  background: 'rgba(197,160,40,0.2)',
                }}>
                  {featuredBanner.beforePhotoUrl && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={featuredBanner.beforePhotoUrl}
                        alt="Before"
                        style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 10, left: 12,
                        background: 'rgba(27,42,74,0.85)', color: '#C5A028',
                        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem',
                        letterSpacing: '2px', textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: 3,
                      }}>
                        Before
                      </div>
                    </div>
                  )}
                  {featuredBanner.afterPhotoUrl && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={featuredBanner.afterPhotoUrl}
                        alt="After"
                        style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 10, left: 12,
                        background: 'rgba(178,34,52,0.9)', color: '#FFFFFF',
                        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem',
                        letterSpacing: '2px', textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: 3,
                      }}>
                        After
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* IN note */}
                {featuredBanner.noteIn && (
                  <div style={{
                    borderLeft: '3px solid #C5A028',
                    paddingLeft: 20,
                  }}>
                    <p style={{
                      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.68rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      color: '#C5A028', margin: '0 0 8px',
                    }}>
                      {senderName}
                    </p>
                    <p style={{
                      fontFamily: 'Georgia, serif', fontSize: '1rem',
                      color: 'rgba(255,255,255,0.9)', lineHeight: 1.75,
                      fontStyle: 'italic', margin: 0,
                    }}>
                      &ldquo;{featuredBanner.noteIn}&rdquo;
                    </p>
                  </div>
                )}

                {/* RN response */}
                {featuredBanner.noteRn && (
                  <div style={{
                    borderLeft: '3px solid #B22234',
                    paddingLeft: 20,
                  }}>
                    <p style={{
                      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.68rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      color: '#B22234', margin: '0 0 8px',
                    }}>
                      {featuredBanner.recipientFirstName || 'Recipient'}
                    </p>
                    <p style={{
                      fontFamily: 'Georgia, serif', fontSize: '1rem',
                      color: 'rgba(255,255,255,0.9)', lineHeight: 1.75,
                      fontStyle: 'italic', margin: 0,
                    }}>
                      &ldquo;{featuredBanner.noteRn}&rdquo;
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Quote Carousel ──────────────────────────────────────────────────── */}
      {quotes.length > 0 && (
        <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1.08rem',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: '#C5A028', margin: '0 0 48px',
            }}>
              ★ From the Community ★
            </p>

            <div style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.5s ease',
              minHeight: 140,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {currentQuote && (
                <>
                  <p style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                    color: '#1B2A4A', lineHeight: 1.8,
                    fontStyle: 'italic', margin: '0 0 20px',
                  }}>
                    &ldquo;{currentQuote.quote}&rdquo;
                  </p>
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem',
                    color: '#C5A028', margin: 0, letterSpacing: '1px',
                  }}>
                    — {currentQuote.name}{(currentQuote.city || currentQuote.state) ? `, in ${[currentQuote.city, currentQuote.state ? (STATE_NAMES[currentQuote.state] ?? currentQuote.state) : ''].filter(Boolean).join(', ')}` : ''}
                  </p>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {quotes.length > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: 8, marginTop: 36,
              }}>
                {quotes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setVisible(false);
                      setTimeout(() => { setQuoteIndex(i); setVisible(true); }, 500);
                    }}
                    aria-label={`Quote ${i + 1}`}
                    style={{
                      width: i === quoteIndex ? 28 : 8,
                      height: 8, borderRadius: 4, border: 'none',
                      background: i === quoteIndex ? '#C5A028' : '#DDDDDD',
                      cursor: 'pointer', padding: 0,
                      transition: 'width 0.3s ease, background 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      )}
    </>
  );
}
