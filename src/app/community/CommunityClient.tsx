'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type {
  CommunityBrigade,
  CommunityBlitz,
  CommunityBump,
  NeighborProfile,
} from './page';

const DEFAULT_AVATARS = [
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-eagle.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-star.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-house.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-medal.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-shield.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-silhouette.png',
];

function getDefaultAvatar(id: string): string {
  return DEFAULT_AVATARS[(id?.charCodeAt(0) ?? 0) % DEFAULT_AVATARS.length];
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysRemaining(dateEnd: string): number {
  if (!dateEnd) return 0;
  const end = new Date(dateEnd);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type Tab = 'all' | 'brigades' | 'blitzes';

interface Props {
  neighbor: NeighborProfile;
  myBrigades: CommunityBrigade[];
  myBlitzes: CommunityBlitz[];
  recentBumps: CommunityBump[];
  suggestedBrigades: CommunityBrigade[];
  activeBlitzes: CommunityBlitz[];
  bannerOptionLabels: Record<number, string>;
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#B22234',
  marginBottom: 12,
  fontWeight: 700,
};

export default function CommunityClient({
  neighbor,
  myBrigades,
  myBlitzes,
  recentBumps,
  suggestedBrigades,
  activeBlitzes,
  bannerOptionLabels,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll when panel open on mobile
  useEffect(() => {
    if (isMobile && panelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, panelOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) setPanelOpen(true);
    if (dx < -50) setPanelOpen(false);
    touchStartX.current = null;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'brigades', label: `Brigades (${myBrigades.length})` },
    { key: 'blitzes', label: `Blitzes (${myBlitzes.length})` },
  ];

  const feedContent = (
    <>
      {activeTab === 'all' && (
        <>
          {myBrigades.length === 0 && (
            <div style={{ background: '#1B2A4A', borderRadius: 8, padding: 28, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
                Welcome to the Community! 🇺🇸
              </p>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
                Join or create a Banner Brigade to see activity from your community.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/brigades" style={{ padding: '10px 20px', background: '#C5A028', color: '#1B2A4A', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                  Find a Brigade
                </Link>
                <Link href="/brigade/create" style={{ padding: '10px 20px', background: '#B22234', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                  Create a Brigade
                </Link>
              </div>
            </div>
          )}
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24, marginBottom: 20 }}>
            <div style={sectionLabelStyle}>★ Recent Banner Bumps</div>
            {recentBumps.length === 0 ? (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', margin: 0 }}>No recent activity.</p>
            ) : (
              recentBumps.map(bump => (
                <div key={bump.bannerId} style={{ padding: '12px 0', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#333333', marginBottom: 2 }}>
                      {bannerOptionLabels[bump.bannerOption] ?? 'Letter'} sent to {bump.recipientCity}, {bump.recipientState}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA' }}>
                      {bump.bannerNumber}
                      {bump.brigadeName && <span style={{ marginLeft: 6, color: '#C5A028' }}>· {bump.brigadeName}</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA', flexShrink: 0 }}>
                    {formatDate(bump.createdOn)}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'brigades' && (
        <div>
          {myBrigades.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
                You haven&apos;t joined any Brigades yet.
              </p>
              <Link href="/brigades" style={{ display: 'inline-block', padding: '12px 24px', background: '#1B2A4A', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                Find a Brigade
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myBrigades.map(brigade => (
                <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>{brigade.name}</div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888' }}>
                        {brigade.typeLabel}
                        {brigade.isVerified && <span style={{ marginLeft: 8, color: '#C5A028' }}>✓ Verified</span>}
                      </div>
                    </div>
                    <span style={{ color: '#C5A028', fontSize: '0.82rem' }}>View →</span>
                  </div>
                </Link>
              ))}
              <Link href="/brigade/create" style={{ display: 'block', padding: '14px', background: '#FFFFFF', border: '2px dashed #CCCCCC', borderRadius: 8, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888', textDecoration: 'none', textAlign: 'center' }}>
                + Create a new Brigade
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'blitzes' && (
        <div>
          {myBlitzes.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
                Your Brigades aren&apos;t participating in any Blitzes yet.
              </p>
              <Link href="/blitzes" style={{ display: 'inline-block', padding: '12px 24px', background: '#1B2A4A', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                Browse Blitzes
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myBlitzes.map(blitz => (
                <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: 8, border: `1px solid ${blitz.statusCode === 121120001 ? '#1B7A3E' : '#EEEEEE'}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>{blitz.name}</div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888' }}>Ends {formatDate(blitz.dateEnd)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {blitz.statusCode === 121120001 && (
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#B22234', marginBottom: 4 }}>
                          {daysRemaining(blitz.dateEnd)} days left
                        </div>
                      )}
                      <span style={{ color: '#C5A028', fontSize: '0.82rem' }}>View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  const desktopLeftPanel = (
    <div>
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 20, marginBottom: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={neighbor.profileImageUrl || getDefaultAvatar(neighbor.neighborId)} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C5A028', marginBottom: 10 }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A' }}>
            {neighbor.displayName || `${neighbor.firstName} ${neighbor.lastName}`.trim()}
          </div>
          {neighbor.handle && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 2 }}>@{neighbor.handle}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, paddingTop: 12, borderTop: '1px solid #EEEEEE' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1B2A4A' }}>{myBrigades.length}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Brigades</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1B2A4A' }}>{myBlitzes.length}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Blitzes</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/profile" style={{ display: 'block', padding: '8px 12px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>Edit Profile</Link>
          <Link href="/my-activity" style={{ display: 'block', padding: '8px 12px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>My Activity</Link>
          <Link href="/submit-banner" style={{ display: 'block', padding: '8px 12px', background: '#B22234', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textDecoration: 'none', textAlign: 'center' }}>★ Banner Bump</Link>
        </div>
      </div>

      {myBrigades.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 16, marginBottom: 16 }}>
          <div style={sectionLabelStyle}>My Brigades</div>
          {myBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brigade.name}</div>
              </div>
            </Link>
          ))}
          <Link href="/brigades" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Brigades →</Link>
        </div>
      )}

      {myBlitzes.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 16 }}>
          <div style={sectionLabelStyle}>My Blitzes</div>
          {myBlitzes.map(blitz => (
            <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} style={{ textDecoration: 'none' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', fontWeight: 600 }}>{blitz.name}</div>
                {blitz.statusCode === 121120001 && (
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#B22234' }}>{daysRemaining(blitz.dateEnd)} days left</div>
                )}
              </div>
            </Link>
          ))}
          <Link href="/blitzes" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Blitzes →</Link>
        </div>
      )}
    </div>
  );

  const desktopRightPanel = (
    <div>
      {activeBlitzes.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 16, marginBottom: 16 }}>
          <div style={sectionLabelStyle}>⚡ Active Blitzes</div>
          {activeBlitzes.map(blitz => (
            <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} style={{ textDecoration: 'none' }}>
              <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 2 }}>{blitz.name}</div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#B22234' }}>{daysRemaining(blitz.dateEnd)} days left</div>
              </div>
            </Link>
          ))}
          <Link href="/blitzes" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>See all Blitzes →</Link>
        </div>
      )}

      {suggestedBrigades.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 16, marginBottom: 16 }}>
          <div style={sectionLabelStyle}>★ Suggested Brigades</div>
          {suggestedBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brigade.name}</div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#888888' }}>{brigade.typeLabel}</div>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/brigades" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Brigades →</Link>
        </div>
      )}

      <div style={{ background: '#1B2A4A', borderRadius: 8, padding: 16 }}>
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 12, fontWeight: 700 }}>Quick Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/submit-banner" style={{ display: 'block', padding: '10px 14px', background: '#B22234', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>★ Banner Bump</Link>
          <Link href="/store" style={{ display: 'block', padding: '10px 14px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}>Visit Store</Link>
          <Link href="/brigade/create" style={{ display: 'block', padding: '10px 14px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}>Create a Brigade</Link>
        </div>
      </div>
    </div>
  );

  // Mobile slide-in panel content
  const mobilePanelContent = (
    <div style={{ padding: '24px 16px 48px', overflowY: 'auto', height: '100%' }}>
      {/* Profile */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={neighbor.profileImageUrl || getDefaultAvatar(neighbor.neighborId)} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C5A028', marginBottom: 8 }} />
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A' }}>
          {neighbor.displayName || `${neighbor.firstName} ${neighbor.lastName}`.trim()}
        </div>
        {neighbor.handle && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>@{neighbor.handle}</div>}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #EEEEEE' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A' }}>{myBrigades.length}</div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Brigades</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A' }}>{myBlitzes.length}</div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Blitzes</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <Link href="/submit-banner" onClick={() => setPanelOpen(false)} style={{ display: 'block', padding: '12px', background: '#B22234', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', textDecoration: 'none', textAlign: 'center' }}>★ Banner Bump</Link>
        <Link href="/profile" onClick={() => setPanelOpen(false)} style={{ display: 'block', padding: '10px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>Edit Profile</Link>
        <Link href="/store" onClick={() => setPanelOpen(false)} style={{ display: 'block', padding: '10px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>Visit Store</Link>
        <Link href="/brigade/create" onClick={() => setPanelOpen(false)} style={{ display: 'block', padding: '10px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>Create a Brigade</Link>
      </div>

      {/* My Brigades */}
      {myBrigades.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelStyle}>My Brigades</div>
          {myBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} onClick={() => setPanelOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brigade.name}</div>
              </div>
            </Link>
          ))}
          <Link href="/brigades" onClick={() => setPanelOpen(false)} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Brigades →</Link>
        </div>
      )}

      {/* My Blitzes */}
      {myBlitzes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelStyle}>My Blitzes</div>
          {myBlitzes.map(blitz => (
            <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} onClick={() => setPanelOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', fontWeight: 600 }}>{blitz.name}</div>
                {blitz.statusCode === 121120001 && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#B22234' }}>{daysRemaining(blitz.dateEnd)} days left</div>}
              </div>
            </Link>
          ))}
          <Link href="/blitzes" onClick={() => setPanelOpen(false)} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Blitzes →</Link>
        </div>
      )}

      {/* Active Blitzes */}
      {activeBlitzes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelStyle}>⚡ Active Blitzes</div>
          {activeBlitzes.map(blitz => (
            <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} onClick={() => setPanelOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', fontWeight: 600 }}>{blitz.name}</div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#B22234' }}>{daysRemaining(blitz.dateEnd)} days left</div>
              </div>
            </Link>
          ))}
          <Link href="/blitzes" onClick={() => setPanelOpen(false)} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>See all Blitzes →</Link>
        </div>
      )}

      {/* Suggested Brigades */}
      {suggestedBrigades.length > 0 && (
        <div>
          <div style={sectionLabelStyle}>★ Suggested Brigades</div>
          {suggestedBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} onClick={() => setPanelOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brigade.name}</div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#888888' }}>{brigade.typeLabel}</div>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/brigades" onClick={() => setPanelOpen(false)} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#C5A028', textDecoration: 'none' }}>Browse all Brigades →</Link>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{ background: '#FAF7F2', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Backdrop */}
        {panelOpen && (
          <div
            onClick={() => setPanelOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 40,
              transition: 'opacity 0.25s',
            }}
          />
        )}

        {/* Slide-in panel */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '85%',
          background: '#FFFFFF',
          zIndex: 50,
          transform: panelOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto',
          boxShadow: panelOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        }}>
          {/* Close button */}
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: '#888888',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
          {mobilePanelContent}
        </div>

        {/* Tab bar */}
        <div style={{ background: '#1B2A4A', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          {/* Avatar tap to open panel */}
          <button
            onClick={() => setPanelOpen(true)}
            style={{ background: 'none', border: 'none', padding: '10px 10px 10px 0', cursor: 'pointer', flexShrink: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={neighbor.profileImageUrl || getDefaultAvatar(neighbor.neighborId)}
              alt="Menu"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A028', display: 'block' }}
            />
          </button>
          <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid #C5A028' : '3px solid transparent',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  color: activeTab === tab.key ? '#C5A028' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div style={{ padding: '20px 16px 80px' }}>
          {feedContent}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <div style={{ background: '#1B2A4A', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #C5A028' : '3px solid transparent',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? '#C5A028' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 24 }}>
        {desktopLeftPanel}
        <div>{feedContent}</div>
        {desktopRightPanel}
      </div>
    </div>
  );
}
