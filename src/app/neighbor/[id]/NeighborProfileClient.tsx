'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import FeedItemCard from '@/components/FeedItem';
import type { FeedItem } from '@/app/api/feed/route';
import type { SidebarData } from '@/lib/community-sidebar';
import type { NeighborProfile, NeighborBrigade } from './page';

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

interface Props {
  profile: NeighborProfile;
  brigades: NeighborBrigade[];
  sidebarData: SidebarData | null;
  neighborId: string | null;
  isOwnProfile: boolean;
}

export default function NeighborProfileClient({
  profile,
  brigades,
  sidebarData,
  neighborId,
  isOwnProfile,
}: Props) {
  const [activeTab, setActiveTab] = useState<'bumps' | 'brigades'>('bumps');
  const [feedItems, setFeedItems] = useState<(FeedItem & { relativeTime: string; bannerOptionLabel: string })[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const loadingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async (before?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setFeedLoading(true);
    try {
      const params = new URLSearchParams({
        top: '20',
        neighborId: profile.neighborId,
        profileNeighborId: profile.neighborId,
      });
      if (before) params.set('before', before);
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      setFeedItems(prev => before ? [...prev, ...data.items] : data.items);
      setFeedHasMore(data.hasMore);
    } catch {
      console.error('Neighbor feed load failed');
    } finally {
      setFeedLoading(false);
      loadingRef.current = false;
    }
  }, [profile.neighborId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && feedHasMore && !loadingRef.current) {
          const lastItem = feedItems[feedItems.length - 1];
          if (lastItem) loadFeed(lastItem.createdOn);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [feedItems, feedHasMore, loadFeed]);

  const displayName = profile.displayName || `${profile.firstName} ${profile.lastName}`.trim();

  const profileContent = (
    <div style={{ background: '#FFFFFF', minHeight: '80vh' }}>

      {/* Banner image */}
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#1B2A4A', overflow: 'hidden' }}>
        {profile.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)' }} />
        )}
        {/* Back arrow */}
        <Link href="/community" style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          background: 'rgba(197,160,40,0.75)', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1B2A4A', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1,
        }}>❮</Link>
      </div>

      {/* Profile section */}
      <div style={{ padding: '0 20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -80, marginBottom: 12 }}>
          {/* Profile circle */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.profileImageUrl || getDefaultAvatar(profile.neighborId)}
            alt={displayName}
            style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover', border: '6px solid #FFFFFF', flexShrink: 0, position: 'relative', zIndex: 2 }}
          />
          {/* Action button */}
          <div style={{ alignSelf: 'flex-end', paddingBottom: 18 }}>
            {isOwnProfile ? (
              <Link
                href={`/neighbor/${profile.neighborId}/edit`}
                style={{
                  display: 'inline-block', padding: '8px 16px',
                  background: 'transparent', color: '#1B2A4A',
                  borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
                  border: '1px solid #CCCCCC',
                }}
              >
                Edit Profile
              </Link>
            ) : (
              <button
                style={{
                  padding: '8px 16px', background: '#1B2A4A', color: '#FFFFFF',
                  borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                }}
              >
                + Follow
              </button>
            )}
          </div>
        </div>

        {/* Name + handle + verified */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1B2A4A' }}>
              {displayName}
            </span>
            {profile.isVerified && (
              <span style={{ color: '#C5A028', fontSize: '0.8rem', fontWeight: 700 }}>✓ VERIFIED</span>
            )}
          </div>
          {profile.handle && (
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#888888', marginTop: 2 }}>
              @{profile.handle}
            </div>
          )}
          {profile.description && (
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#444444', lineHeight: 1.6, margin: '8px 0' }}>
              {profile.description}
            </p>
          )}
          {(profile.city || profile.state) && (
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 4 }}>
              📍 {[profile.city, profile.state].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 4 }}>
            Joined {formatDate(profile.createdOn)}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
            <strong style={{ color: '#1B2A4A' }}>{brigades.length}</strong> Brigade{brigades.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', background: '#FFFFFF', position: 'sticky', top: 64, zIndex: 10 }}>
        {(['bumps', 'brigades'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '14px 0', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '3px solid #B22234' : '3px solid transparent',
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#B22234' : '#888888',
              cursor: 'pointer',
            }}
          >
            {tab === 'bumps' ? 'Bumps' : `Brigades (${brigades.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* Bumps tab */}
        {activeTab === 'bumps' && (
          <div>
            {feedItems.map(item => <FeedItemCard key={item.id} item={item} />)}
            {feedLoading && (
              <div style={{ textAlign: 'center', padding: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
                Loading...
              </div>
            )}
            {!feedHasMore && feedItems.length > 0 && (
              <div style={{ textAlign: 'center', padding: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
                ★ All caught up! ★
              </div>
            )}
            {feedItems.length === 0 && !feedLoading && (
              <p style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA' }}>
                No Banner Bumps yet.
              </p>
            )}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>
        )}

        {/* Brigades tab */}
        {activeTab === 'brigades' && (
          <div>
            {brigades.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA' }}>
                Not a member of any Brigades yet.
              </p>
            ) : (
              brigades.map(brigade => (
                <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                      alt={brigade.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                        {brigade.name}
                      </div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                        {brigade.typeLabel}
                        {brigade.isVerified && <span style={{ marginLeft: 6, color: '#C5A028' }}>✓ Verified</span>}
                      </div>
                    </div>
                    <span style={{ color: '#C5A028', fontSize: '0.82rem' }}>View →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (sidebarData) {
    return (
      <CommunityLayout sidebarData={sidebarData} hideAvatarBar={true}>
        {profileContent}
      </CommunityLayout>
    );
  }
  return profileContent;
}
