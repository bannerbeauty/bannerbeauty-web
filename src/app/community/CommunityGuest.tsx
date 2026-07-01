'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FeedItemCard from '@/components/FeedItem';
import type { FeedItem } from '@/app/api/feed/route';

function relativeTime(iso: string): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

export default function CommunityGuest() {
  const [feedItems, setFeedItems] = useState<(FeedItem & { relativeTime: string; bannerOptionLabel: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const loadingRef = useRef(false);
  const hasLoadedOnce = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadFeed = async (before?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ top: '20' });
      if (before) params.set('before', before);
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      const hydrated = (data.items ?? []).map((item: FeedItem) => ({
        ...item,
        relativeTime: relativeTime(item.createdOn),
        bannerOptionLabel: BANNER_OPTION_LABELS[item.bannerOption] ?? 'Letter',
      }));
      setFeedItems(prev => {
        const combined = before ? [...prev, ...hydrated] : hydrated;
        const seen = new Set<string>();
        return combined.filter((item: typeof combined[0]) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
      setHasMore(data.hasMore);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadFeed().then(() => { hasLoadedOnce.current = true; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && hasLoadedOnce.current) {
          const lastItem = feedItems[feedItems.length - 1];
          if (lastItem) loadFeed(lastItem.createdOn);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedItems, hasMore]);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* CTA Banner */}
      <div style={{ background: '#1B2A4A', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', margin: '0 0 8px', fontWeight: 700 }}>
          America&apos;s Patriotic Community
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px' }}>
          Join your neighbors in honoring America
        </h1>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ display: 'inline-block', padding: '12px 28px', background: '#B22234', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}>
            ★ Join Banner Beauty
          </Link>
          <Link href="/signin" style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', textDecoration: 'none' }}>
            Log In for Full Experience
          </Link>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B22234', fontWeight: 700, marginBottom: 16 }}>
          ★ Live Community Activity
        </p>

        {error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#B22234' }}>
            Failed to load feed. Please refresh.
          </div>
        )}

        {!error && feedItems.map(item => (
          <FeedItemCard key={item.id} item={item} />
        ))}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
            Loading...
          </div>
        )}

        {!hasMore && feedItems.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
            ★ You&apos;ve seen it all — sign up to participate! ★
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && feedItems.length > 0 && (
          <div style={{ background: '#1B2A4A', borderRadius: 8, padding: '24px 20px', textAlign: 'center', marginTop: 24, marginBottom: 24 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px' }}>
              Ready to Banner Bump a neighbor?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ display: 'inline-block', padding: '12px 28px', background: '#B22234', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}>
                ★ Join Banner Beauty
              </Link>
              <Link href="/signin" style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', textDecoration: 'none' }}>
                Log In for Full Experience
              </Link>
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
