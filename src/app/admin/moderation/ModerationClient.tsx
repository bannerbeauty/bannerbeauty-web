'use client';

import { useState } from 'react';
import type { ModerationBanner } from './page';

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type FilterKey = 'pending' | 'approved' | 'rejected';

interface Props {
  pending: ModerationBanner[];
  approved: ModerationBanner[];
  rejected: ModerationBanner[];
}

export default function ModerationClient({ pending, approved, rejected }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actioning, setActioning] = useState(false);
  const [localBanners, setLocalBanners] = useState({ pending, approved, rejected });

  const banners = localBanners[activeFilter];
  const banner = banners[currentIndex] ?? null;
  const total = banners.length;

  const handleFilter = (filter: FilterKey) => {
    setActiveFilter(filter);
    setCurrentIndex(0);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!banner) return;
    setActioning(true);
    try {
      await fetch('/api/flows/banner-moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId: banner.bannerId, action }),
      });

      // Remove from current list and update counts
      setLocalBanners(prev => {
        const updated = { ...prev };
        updated[activeFilter] = prev[activeFilter].filter(b => b.bannerId !== banner.bannerId);
        // Add to appropriate list
        const updatedBanner = {
          ...banner,
          isFeatureable: action === 'approve',
          isRejected: action === 'reject',
        };
        if (action === 'approve') {
          updated.approved = [updatedBanner, ...prev.approved];
          updated.rejected = prev.rejected.filter(b => b.bannerId !== banner.bannerId);
        } else {
          updated.rejected = [updatedBanner, ...prev.rejected];
          updated.approved = prev.approved.filter(b => b.bannerId !== banner.bannerId);
        }
        return updated;
      });

      // Stay on same index (next item slides in) or go back if last
      setCurrentIndex(prev => Math.min(prev, banners.length - 2));
    } catch {
      console.error('Moderation action failed');
    } finally {
      setActioning(false);
    }
  };

  const filterButtons: { key: FilterKey; label: string; color: string }[] = [
    { key: 'pending', label: `Pending (${localBanners.pending.length})`, color: '#C5A028' },
    { key: 'approved', label: `Approved (${localBanners.approved.length})`, color: '#1B7A3E' },
    { key: 'rejected', label: `Rejected (${localBanners.rejected.length})`, color: '#B22234' },
  ];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Content Moderation
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Dashboard
          </a>
          <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Site
          </a>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEE', padding: '12px 24px', display: 'flex', gap: 12 }}>
        {filterButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => handleFilter(btn.key)}
            style={{
              padding: '8px 20px',
              background: activeFilter === btn.key ? btn.color : 'transparent',
              color: activeFilter === btn.key ? '#FFFFFF' : btn.color,
              border: `2px solid ${btn.color}`,
              borderRadius: 20,
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>

        {!banner ? (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem', color: '#AAAAAA' }}>
            {activeFilter === 'pending' ? '✅ No items pending review.' : activeFilter === 'approved' ? 'No approved items.' : 'No rejected items.'}
          </div>
        ) : (
          <>
            {/* Navigation bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button
                onClick={() => setCurrentIndex(v => Math.max(0, v - 1))}
                disabled={currentIndex === 0}
                style={{ padding: '8px 20px', background: '#FFFFFF', border: '1.5px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}
              >
                ← Back
              </button>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888' }}>
                {currentIndex + 1} of {total}
              </div>
              <button
                onClick={() => setCurrentIndex(v => Math.min(total - 1, v + 1))}
                disabled={currentIndex === total - 1}
                style={{ padding: '8px 20px', background: '#FFFFFF', border: '1.5px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', cursor: currentIndex === total - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === total - 1 ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>

            {/* Banner card */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>

              {/* Banner header */}
              <div style={{ background: '#F5F5F5', padding: '12px 20px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '1rem' }}>{banner.bannerNumber}</span>
                  <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginLeft: 12 }}>
                    {BANNER_OPTION_LABELS[banner.bannerOption] ?? 'Letter'} · {banner.recipientCity}, {banner.recipientState} · {formatDate(banner.createdOn)}
                  </span>
                </div>
                <div style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: banner.isRejected ? '#FFF0F0' : banner.isFeatureable ? '#F0FFF4' : '#FFFBEE',
                  color: banner.isRejected ? '#B22234' : banner.isFeatureable ? '#1B7A3E' : '#C5A028',
                }}>
                  {banner.isRejected ? 'Rejected' : banner.isFeatureable ? 'Approved' : 'Pending'}
                </div>
              </div>

              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Attribution */}
                  {banner.attributionName && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        Dedication
                      </div>
                      <div style={{ background: '#1B2A4A', borderRadius: 6, padding: '16px', borderTop: '2px solid #C5A028', borderBottom: '2px solid #C5A028' }}>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 6 }}>
                          In Honor / Memory Of
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                          {banner.attributionName}
                        </div>
                        {banner.attributionText && (
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                            &ldquo;{banner.attributionText}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IN Note */}
                  {banner.noteIn && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        IN Note
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontStyle: 'italic', color: '#444', lineHeight: 1.7, background: '#FAF7F2', padding: '12px 16px', borderRadius: 6, margin: 0, border: '1px solid #EEEEEE' }}>
                        &ldquo;{banner.noteIn}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* RN Note */}
                  {banner.noteRn && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        RN Note
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontStyle: 'italic', color: '#444', lineHeight: 1.7, background: '#FAF7F2', padding: '12px 16px', borderRadius: 6, margin: 0, border: '1px solid #EEEEEE' }}>
                        &ldquo;{banner.noteRn}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Right column — photos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Attribution photo */}
                  {banner.attributionPhoto && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        Honoree Photo
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.attributionPhoto} alt="Honoree" style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 200 }} />
                    </div>
                  )}

                  {/* Before photo */}
                  {banner.beforePhotoUrl && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        Before Photo
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.beforePhotoUrl} alt="Before" style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 200 }} />
                    </div>
                  )}

                  {/* After photo */}
                  {banner.afterPhotoUrl && (
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
                        After Photo
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.afterPhotoUrl} alt="After" style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 200 }} />
                    </div>
                  )}

                  {!banner.attributionPhoto && !banner.beforePhotoUrl && !banner.afterPhotoUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, background: '#F5F5F5', borderRadius: 6 }}>
                      <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>No photos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #EEEEEE', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={actioning}
                  style={{
                    padding: '10px 28px',
                    background: '#FFFFFF',
                    color: '#B22234',
                    border: '2px solid #B22234',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: actioning ? 'not-allowed' : 'pointer',
                    opacity: actioning ? 0.6 : 1,
                  }}
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actioning}
                  style={{
                    padding: '10px 28px',
                    background: '#1B7A3E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: actioning ? 'not-allowed' : 'pointer',
                    opacity: actioning ? 0.6 : 1,
                  }}
                >
                  ✓ Approve
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
