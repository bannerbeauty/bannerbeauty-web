'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminBlitz } from './page';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type SortKey = 'bumps' | 'brigades' | 'newest' | 'ending';

export default function BlitzesAdminClient({ blitzes }: { blitzes: AdminBlitz[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('bumps');

  const sorted = [...blitzes].sort((a, b) => {
    if (sortKey === 'bumps') return b.bumpCount - a.bumpCount;
    if (sortKey === 'brigades') return b.brigadeCount - a.brigadeCount;
    if (sortKey === 'ending') return new Date(a.dateEnd).getTime() - new Date(b.dateEnd).getTime();
    return 0; // newest is already default order from query
  });

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'bumps', label: 'Most Bumps' },
    { key: 'brigades', label: 'Most Brigades' },
    { key: 'newest', label: 'Newest' },
    { key: 'ending', label: 'Ending Soon' },
  ];

  const totalBumps = blitzes.reduce((sum, b) => sum + b.bumpCount, 0);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Blitzes
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Summary */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 24px', marginBottom: 20, display: 'flex', gap: 32, borderTop: '3px solid #E87722' }}>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Total Blitzes</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B2A4A' }}>{blitzes.length}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Total Bumps Generated</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B2A4A' }}>{totalBumps.toLocaleString()}</div>
          </div>
        </div>

        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {sortButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setSortKey(btn.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `2px solid ${sortKey === btn.key ? '#E87722' : '#DDDDDD'}`,
                background: sortKey === btn.key ? '#E87722' : 'transparent',
                color: sortKey === btn.key ? '#FFFFFF' : '#888888',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Blitzes list */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              No blitzes found.
            </div>
          ) : (
            sorted.map((b, i) => (
              <div key={b.blitzId} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 140px 100px',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderBottom: i < sorted.length - 1 ? '1px solid #F5F5F5' : 'none',
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
              }}>
                <div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                    {b.name}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                    {b.statusLabel} · {formatDate(b.dateStart)} – {formatDate(b.dateEnd)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', fontSize: '1.1rem' }}>
                    {b.bumpCount}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#AAAAAA' }}>bumps</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '1.1rem' }}>
                    {b.brigadeCount}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#AAAAAA' }}>brigades</div>
                </div>

                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textAlign: 'center' }}>
                  {b.blitzNumber}
                </div>

                <Link href={`/blitz/${b.blitzId}`} target="_blank" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
                  View →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
