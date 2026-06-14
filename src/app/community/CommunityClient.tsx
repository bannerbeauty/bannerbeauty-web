'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import FeedItemCard from '@/components/FeedItem';
import type { FeedItem } from '@/app/api/feed/route';
import type { SidebarData } from '@/lib/community-sidebar';
import type { CommunityBump, NeighborProfile } from './page';

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

type Tab = 'all' | 'brigades' | 'blitzes' | 'buddies';

interface Props {
  neighbor: NeighborProfile;
  sidebarData: SidebarData;
  recentBumps: CommunityBump[];
  bannerOptionLabels: Record<number, string>;
}

const TAB_BAR_H = 52;

export default function CommunityClient({
  neighbor: _neighbor,
  sidebarData,
  recentBumps: _recentBumps,
  bannerOptionLabels: _bannerOptionLabels,
}: Props) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [feedItems, setFeedItems] = useState<(FeedItem & { relativeTime: string; bannerOptionLabel: string })[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const loadingRef = useRef(false);
  const hasLoadedOnce = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const brigadeIds = sidebarData.myBrigades.map(b => b.brigadeId).join(',');
  const blitzIds = sidebarData.myBlitzes.map(b => b.blitzId).join(',');
  const buddyIds = sidebarData.buddyIds?.join(',') ?? '';

  const loadFeed = useCallback(async (before?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setFeedLoading(true);
    try {
      const params = new URLSearchParams({
        top: '20',
        neighborId: sidebarData.neighbor.neighborId,
        state: sidebarData.neighbor.state ?? '',
        brigadeIds,
        blitzIds,
        buddyIds,
      });
      if (before) params.set('before', before);
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      setFeedItems(prev => {
        const combined = before ? [...prev, ...data.items] : data.items;
        const seen = new Set<string>();
        return combined.filter((item: (typeof combined)[0]) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
      setFeedHasMore(data.hasMore);
    } catch {
      setFeedError(true);
    } finally {
      setFeedLoading(false);
      loadingRef.current = false;
    }
  }, [sidebarData.neighbor.neighborId, sidebarData.neighbor.state, brigadeIds, blitzIds, buddyIds]);

  useEffect(() => {
    setFeedItems([]);
    setFeedHasMore(true);
    hasLoadedOnce.current = false;
    loadFeed().then(() => { hasLoadedOnce.current = true; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && feedHasMore && !loadingRef.current && hasLoadedOnce.current) {
          const lastItem = feedItems[feedItems.length - 1];
          if (lastItem) loadFeed(lastItem.createdOn);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [feedItems, feedHasMore, loadFeed]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'brigades', label: `Brigades (${sidebarData.myBrigades.length})` },
    { key: 'blitzes', label: `Blitzes (${sidebarData.myBlitzes.length})` },
    { key: 'buddies', label: `Buddies (${sidebarData.buddyIds?.length ?? 0})` },
  ];

  const tabBar = (
    <div style={{ display: 'flex', alignItems: 'center', height: TAB_BAR_H, background: '#1B2A4A', padding: '0 8px' }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: '0 14px',
            height: TAB_BAR_H,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab.key ? '3px solid #C5A028' : '3px solid transparent',
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.85rem',
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
  );

  const feedContent = (
    <>
      {activeTab === 'all' && (
        <>
          {sidebarData.myBrigades.length === 0 && (
            <div style={{ background: '#1B2A4A', borderRadius: 8, padding: 28, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
                Welcome to the Community! 🇺🇸
              </p>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
                Join or create a Banner Brigade to see activity from your community.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/brigades" style={{ padding: '10px 20px', background: '#C5A028', color: '#1B2A4A', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>Find a Brigade</Link>
                <Link href="/brigade/create" style={{ padding: '10px 20px', background: '#B22234', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>Create a Brigade</Link>
              </div>
            </div>
          )}

          {feedItems.map(item => (
            <FeedItemCard key={item.id} item={item} />
          ))}

          {feedLoading && (
            <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              Loading...
            </div>
          )}

          {!feedHasMore && feedItems.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              ★ You&apos;re all caught up! ★
            </div>
          )}

          {feedError && (
            <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#B22234' }}>
              Failed to load feed. Please refresh.
            </div>
          )}

          <div ref={bottomRef} style={{ height: 1 }} />
        </>
      )}

      {activeTab === 'brigades' && (
        <div>
          {sidebarData.myBrigades.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>You haven&apos;t joined any Brigades yet.</p>
              <Link href="/brigades" style={{ display: 'inline-block', padding: '12px 24px', background: '#1B2A4A', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>Find a Brigade</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sidebarData.myBrigades.map(brigade => (
                <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
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
          {sidebarData.myBlitzes.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>Your Brigades aren&apos;t participating in any Blitzes yet.</p>
              <Link href="/blitzes" style={{ display: 'inline-block', padding: '12px 24px', background: '#1B2A4A', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>Browse Blitzes</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sidebarData.myBlitzes.map(blitz => (
                <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ background: '#FFFFFF', borderRadius: 8, border: `1px solid ${blitz.statusCode === 121120001 ? '#1B7A3E' : '#EEEEEE'}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>{blitz.name}</div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888' }}>Ends {formatDate(blitz.dateEnd)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {blitz.statusCode === 121120001 && (
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#B22234', marginBottom: 4 }}>{daysRemaining(blitz.dateEnd)} days left</div>
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

      {activeTab === 'buddies' && (
        <div>
          {sidebarData.buddyIds?.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
                You aren&apos;t following anyone yet.
              </p>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA', margin: 0 }}>
                Visit a Neighbor&apos;s profile and tap Follow to see their activity here.
              </p>
            </div>
          ) : (
            feedItems
              .filter(item => sidebarData.buddyIds?.includes(item.neighborId))
              .map(item => <FeedItemCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </>
  );

  const desktopRightPanel = (
    <div>
      {sidebarData.myBlitzes.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B22234', marginBottom: 12, fontWeight: 700 }}>⚡ Active Blitzes</div>
          {sidebarData.myBlitzes.map(blitz => (
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

  return (
    <CommunityLayout sidebarData={sidebarData} tabBar={tabBar} threeColumn rightPanel={desktopRightPanel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {feedContent}
      </div>
    </CommunityLayout>
  );
}
