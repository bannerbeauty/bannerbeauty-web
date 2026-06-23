'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import FeedItemCard from '@/components/FeedItem';
import type { FeedItem } from '@/app/api/feed/route';
import type { BlitzDetail, BlitzBrigadeItem, BlitzBump, UserBrigade } from './page';
import type { SidebarData } from '@/lib/community-sidebar';

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
  const diff = new Date(dateEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface Props {
  blitz: BlitzDetail;
  participatingBrigades: BlitzBrigadeItem[];
  pendingBrigades: BlitzBrigadeItem[];
  recentBumps: BlitzBump[];
  userBrigades: UserBrigade[];
  neighborId: string | null;
  isBlitzAdmin: boolean;
  bannerOptionLabels: Record<number, string>;
  sidebarData: SidebarData | null;
}

export default function BlitzDetailClient({
  blitz,
  participatingBrigades,
  pendingBrigades,
  recentBumps,
  userBrigades,
  neighborId,
  isBlitzAdmin,
  bannerOptionLabels,
  sidebarData,
}: Props) {
  const [selectedBrigadeId, setSelectedBrigadeId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'bumps' | 'brigades' | 'pending'>('bumps');

  const [feedItems, setFeedItems] = useState<(FeedItem & { relativeTime: string; bannerOptionLabel: string })[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const loadingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isOwner = neighborId === blitz.ownerNeighborId;

  const participatingIds = new Set(participatingBrigades.map(b => b.brigadeId));
  const pendingIds = new Set(pendingBrigades.map(b => b.brigadeId));
  const eligibleBrigades = userBrigades.filter(b => !participatingIds.has(b.brigadeId) && !pendingIds.has(b.brigadeId));

  const loadFeed = useCallback(async (before?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setFeedLoading(true);
    try {
      const params = new URLSearchParams({
        top: '20',
        neighborId: neighborId ?? '',
        blitzIds: blitz.blitzId,
        filterByBrigade: 'true',
      });
      if (before) params.set('before', before);
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      setFeedItems(prev => before ? [...prev, ...data.items] : data.items);
      setFeedHasMore(data.hasMore);
    } catch {
      console.error('Blitz feed load failed');
    } finally {
      setFeedLoading(false);
      loadingRef.current = false;
    }
  }, [blitz.blitzId, neighborId]);

  useEffect(() => {
    setFeedItems([]);
    setFeedHasMore(true);
    loadFeed();
  }, []);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && feedHasMore && !loadingRef.current) {
        const last = feedItems[feedItems.length - 1];
        if (last) loadFeed(last.createdOn);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [feedItems, feedHasMore, loadFeed]);

  const handleJoinRequest = async () => {
    if (!selectedBrigadeId) { setError('Please select a Brigade.'); return; }
    setRequesting(true);
    setError('');
    try {
      await fetch('/api/flows/blitz-join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blitzId: blitz.blitzId, brigadeId: selectedBrigadeId }),
      });
      setRequestSent(true);
    } catch {
      setError('Request failed. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const blitzContent = (
    <div style={{ background: '#FFFFFF', minHeight: '80vh' }}>

      {/* Banner image */}
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#1B2A4A', overflow: 'hidden' }}>
        {blitz.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blitz.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)' }} />
        )}
        <Link href="/community" style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          background: 'rgba(197,160,40,0.75)', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1B2A4A', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1,
        }}>❮</Link>
      </div>

      {/* Profile section */}
      <div style={{ padding: '16px 20px 0', background: '#FFFFFF' }}>

        {/* Name + status + action button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1B2A4A' }}>{blitz.name}</span>
              <span style={{ background: blitz.statusColor, color: '#FFFFFF', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                {blitz.statusLabel}
              </span>
            </div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#888888', marginTop: 2 }}>
              {formatDate(blitz.dateStart)} — {formatDate(blitz.dateEnd)}
              {' · '}Organized by {blitz.ownerFirstName} {blitz.ownerLastName}
            </div>
            {blitz.description && (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#444444', lineHeight: 1.6, margin: '8px 0' }}>
                {blitz.description}
              </p>
            )}
          </div>
          {/* Action button */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {isOwner && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '8px 16px', background: 'rgba(197,160,40,0.15)', color: '#C5A028', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #C5A028' }}>
                  ★ Organizer
                </span>
                <Link
                  href={`/blitz/${blitz.blitzId}/edit`}
                  style={{
                    display: 'inline-block', padding: '8px 16px',
                    background: 'transparent', color: '#1B2A4A',
                    borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
                    border: '1px solid #CCCCCC', marginLeft: 8,
                  }}
                >
                  Edit
                </Link>
              </div>
            )}
            {!isOwner && isBlitzAdmin && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '8px 16px', background: 'rgba(197,160,40,0.15)', color: '#C5A028', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #C5A028' }}>
                  ★ Admin
                </span>
                <Link
                  href={`/blitz/${blitz.blitzId}/edit`}
                  style={{
                    display: 'inline-block', padding: '8px 16px',
                    background: 'transparent', color: '#1B2A4A',
                    borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
                    border: '1px solid #CCCCCC', marginLeft: 8,
                  }}
                >
                  Edit
                </Link>
              </div>
            )}
            {eligibleBrigades.length > 0 && !requestSent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={selectedBrigadeId}
                  onChange={e => setSelectedBrigadeId(e.target.value)}
                  style={{ padding: '8px 12px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', border: '1.5px solid #DDDDDD', borderRadius: 20 }}
                >
                  <option value="">Select Brigade...</option>
                  {eligibleBrigades.map(b => <option key={b.brigadeId} value={b.brigadeId}>{b.brigadeName}</option>)}
                </select>
                <button
                  onClick={handleJoinRequest}
                  disabled={requesting}
                  style={{ padding: '8px 16px', background: '#B22234', color: '#FFFFFF', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  {requesting ? 'Requesting...' : '★ Request to Join'}
                </button>
              </div>
            )}
            {requestSent && (
              <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#888888', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', border: '1px solid #DDDDDD' }}>
                ⏳ Request Pending
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
            <strong style={{ color: '#1B2A4A' }}>{participatingBrigades.length}</strong> Brigade{participatingBrigades.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
            <strong style={{ color: '#1B2A4A' }}>{recentBumps.length === 20 ? '20+' : recentBumps.length}</strong> Bumps
          </span>
          {blitz.statusCode === 121120001 && (
            <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#B22234' }}>
              <strong>{daysRemaining(blitz.dateEnd)}</strong> days left
            </span>
          )}
        </div>

        {/* Share */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://www.bannerbeauty.com/blitz/${blitz.blitzId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1877F2', color: '#FFFFFF', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Join%20our%20Banner%20Blitz!%20%F0%9F%87%BA%F0%9F%87%B8%20We%27re%20Banner%20Bumping%20neighbors%20with%20tattered%20flags.%20Come%20join%20us!%20%23BannerBeauty%20%23PatrioticNeighbors%20%23America250&url=https://www.bannerbeauty.com/blitz/${blitz.blitzId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#000000', color: '#FFFFFF', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
          <a
            href={`sms:?body=Join%20our%20Banner%20Blitz!%20%F0%9F%87%BA%F0%9F%87%B8%20https://www.bannerbeauty.com/blitz/${blitz.blitzId}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1B7A3E', color: '#FFFFFF', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            SMS
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://www.bannerbeauty.com/blitz/${blitz.blitzId}`);
              alert('Link copied!');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#C5A028', color: '#FFFFFF', borderRadius: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            Copy Link
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 10 }}>
        {(['bumps', 'brigades', ...((isOwner || isBlitzAdmin) && pendingBrigades.length > 0 ? ['pending'] : [])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'bumps' | 'brigades' | 'pending')}
            style={{
              flex: 1, padding: '14px 0', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '3px solid #B22234' : '3px solid transparent',
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#B22234' : '#888888',
              cursor: 'pointer',
            }}
          >
            {tab === 'bumps' ? 'Bumps' : tab === 'brigades' ? `Brigades (${participatingBrigades.length})` : `Pending (${pendingBrigades.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* Bumps tab */}
        {activeTab === 'bumps' && (
          <div>
            {feedItems.map(item => <FeedItemCard key={item.id} item={item} />)}
            {feedLoading && <div style={{ textAlign: 'center', padding: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>Loading...</div>}
            {!feedHasMore && feedItems.length > 0 && <div style={{ textAlign: 'center', padding: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>★ All caught up! ★</div>}
            {feedItems.length === 0 && !feedLoading && <p style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA' }}>No bumps yet!</p>}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>
        )}

        {/* Brigades tab — leaderboard */}
        {activeTab === 'brigades' && (
          <div>
            {participatingBrigades.map((brigade, index) => (
              <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: index === 0 ? '#C5A028' : index === 1 ? '#AAAAAA' : index === 2 ? '#B87333' : '#EEEEEE',
                    color: index < 3 ? '#FFFFFF' : '#888888',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700,
                  }}>
                    {index + 1}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brigade.brigadeProfileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.brigadeName}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>{brigade.brigadeName}</div>
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#B22234', flexShrink: 0 }}>
                    {brigade.bumpCount} {brigade.bumpCount === 1 ? 'Bump' : 'Bumps'}
                  </div>
                </div>
              </Link>
            ))}
            {participatingBrigades.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA' }}>No Brigades participating yet.</p>
            )}
          </div>
        )}

        {/* Pending tab — owner or Blitz admin */}
        {activeTab === 'pending' && (isOwner || isBlitzAdmin) && (
          <div>
            {pendingBrigades.map(brigade => (
              <div key={brigade.blitzbrigadeid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.brigadeProfileImageUrl || getDefaultAvatar(brigade.brigadeId)} alt={brigade.brigadeName}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>{brigade.brigadeName}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={async () => {
                    await fetch('/api/flows/blitz-approve-brigade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blitzbrigadeid: brigade.blitzbrigadeid, action: 'approve' }) });
                    window.location.reload();
                  }} style={{ padding: '6px 12px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    ✓ Approve
                  </button>
                  <button onClick={async () => {
                    await fetch('/api/flows/blitz-approve-brigade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blitzbrigadeid: brigade.blitzbrigadeid, action: 'deny' }) });
                    window.location.reload();
                  }} style={{ padding: '6px 12px', background: '#B22234', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    ✗ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (sidebarData) {
    return (
      <CommunityLayout sidebarData={sidebarData} hideAvatarBar={true}>
        {blitzContent}
      </CommunityLayout>
    );
  }
  return blitzContent;
}
