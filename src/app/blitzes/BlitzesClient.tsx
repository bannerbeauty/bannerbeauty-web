'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BlitzListItem } from './page';

const PAGE_SIZE = 25;

interface Props {
  blitzes: BlitzListItem[];
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.85rem',
  border: '1.5px solid #DDDDDD',
  borderRadius: 4,
  color: '#333333',
  background: '#FFFFFF',
  cursor: 'pointer',
};

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

export default function BlitzesClient({ blitzes }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'newest' | 'ending'>('ending');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...blitzes];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q));
    }

    if (filterStatus !== '') {
      result = result.filter(b => b.statusCode === filterStatus);
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
    } else {
      // Ending soonest — active first, then upcoming
      result.sort((a, b) => {
        if (a.statusCode === 121120001 && b.statusCode !== 121120001) return -1;
        if (b.statusCode === 121120001 && a.statusCode !== 121120001) return 1;
        return new Date(a.dateEnd).getTime() - new Date(b.dateEnd).getTime();
      });
    }

    return result;
  }, [blitzes, search, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh' }}>

      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 8px',
          }}>
            ★ Banner Blitzes
          </p>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
          }}>
            Active Banner Blitzes
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            margin: '10px 0 0',
          }}>
            Join a time-limited Banner Bump campaign with your Brigade.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEE', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            style={{ ...selectStyle, minWidth: 200, flex: 1, fontSize: '16px' }}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value === '' ? '' : Number(e.target.value)); resetPage(); }}
            style={selectStyle}
          >
            <option value="">All Statuses</option>
            <option value="1">Upcoming</option>
            <option value="121120001">Active</option>
            <option value="2">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value as 'newest' | 'ending'); resetPage(); }}
            style={selectStyle}
          >
            <option value="ending">Ending Soonest</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        <div style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.82rem',
          color: '#888888',
          marginBottom: 20,
        }}>
          Showing {filtered.length} Blitz{filtered.length !== 1 ? 'es' : ''}
          {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
        </div>

        {paginated.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid #EEEEEE',
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: 0 }}>
              No Blitzes found. Create one from your Brigade page!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginated.map(blitz => {
              const days = daysRemaining(blitz.dateEnd);
              const isActive = blitz.statusCode === 121120001;
              const isUpcoming = blitz.statusCode === 1;

              return (
                <Link
                  key={blitz.blitzId}
                  href={`/blitz/${blitz.blitzId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? '#1B7A3E' : '#EEEEEE'}`,
                      padding: '20px 24px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: '#1B2A4A',
                          }}>
                            {blitz.name}
                          </span>
                          <span style={{
                            background: blitz.statusColor,
                            color: '#FFFFFF',
                            fontFamily: 'Trebuchet MS, sans-serif',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            whiteSpace: 'nowrap',
                          }}>
                            {blitz.statusLabel}
                          </span>
                        </div>
                        <div style={{
                          fontFamily: 'Trebuchet MS, sans-serif',
                          fontSize: '0.78rem',
                          color: '#888888',
                          marginBottom: 6,
                        }}>
                          {formatDate(blitz.dateStart)} — {formatDate(blitz.dateEnd)}
                          {' · '} Organized by {blitz.ownerName}
                        </div>
                        {blitz.description && (
                          <div style={{
                            fontFamily: 'Trebuchet MS, sans-serif',
                            fontSize: '0.82rem',
                            color: '#555555',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 500,
                          }}>
                            {blitz.description}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {isActive && days > 0 && (
                          <div style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#B22234',
                            marginBottom: 4,
                          }}>
                            {days} day{days !== 1 ? 's' : ''} left
                          </div>
                        )}
                        {isUpcoming && (
                          <div style={{
                            fontFamily: 'Trebuchet MS, sans-serif',
                            fontSize: '0.78rem',
                            color: '#C5A028',
                            marginBottom: 4,
                          }}>
                            Starts {formatDate(blitz.dateStart)}
                          </div>
                        )}
                        <div style={{ color: '#C5A028', fontSize: '0.82rem' }}>
                          View →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                background: page === 1 ? '#EEEEEE' : '#1B2A4A',
                color: page === 1 ? '#AAAAAA' : '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Previous
            </button>
            <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px',
                background: page === totalPages ? '#EEEEEE' : '#1B2A4A',
                color: page === totalPages ? '#AAAAAA' : '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
