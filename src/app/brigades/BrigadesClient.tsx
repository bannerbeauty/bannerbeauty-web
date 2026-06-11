'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BrigadeListItem } from './page';

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

const BRIGADE_TYPES = [
  { label: 'Law Enforcement', value: 121120000 },
  { label: 'Fire & Rescue', value: 121120001 },
  { label: 'Medical', value: 121120002 },
  { label: 'Military Unit', value: 121120003 },
  { label: 'Veteran Organization', value: 121120004 },
  { label: 'Civic Organization', value: 121120005 },
  { label: 'School or University', value: 121120006 },
  { label: 'Club or Association', value: 121120007 },
  { label: 'Other', value: 121120008 },
];

const BRIGADE_SCOPES = [
  { label: 'Nationwide', value: 121120000 },
  { label: 'Statewide', value: 121120001 },
  { label: 'Countywide', value: 121120002 },
  { label: 'Citywide', value: 121120003 },
  { label: 'Neighborhood', value: 121120004 },
  { label: 'Custom', value: 121120005 },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const PAGE_SIZE = 25;

interface Props {
  brigades: BrigadeListItem[];
  isLoggedIn: boolean;
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

export default function BrigadesClient({ brigades, isLoggedIn }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<number | ''>('');
  const [filterScope, setFilterScope] = useState<number | ''>('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'newest'>('alpha');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...brigades];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q));
    }
    if (filterType !== '') result = result.filter(b => b.brigadeType === filterType);
    if (filterScope !== '') result = result.filter(b => b.brigadeScope === filterScope);
    if (filterState) result = result.filter(b => b.brigadeState === filterState);
    if (filterCity) result = result.filter(b => b.brigadeCity.toLowerCase().includes(filterCity.toLowerCase()));

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [brigades, search, filterType, filterScope, filterState, filterCity, sortBy]);

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
            ★ Banner Brigades
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Find Your Brigade
            </h1>
            {isLoggedIn && (
              <Link
                href="/brigade/create"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#B22234',
                  color: '#FFFFFF',
                  borderRadius: 4,
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ★ Create a Brigade
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEE', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

          {/* Search */}
          <input
            type="search"
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            style={{
              ...selectStyle,
              minWidth: 200,
              flex: 1,
              fontSize: '16px',
            }}
          />

          {/* Type */}
          <select value={filterType} onChange={e => { setFilterType(e.target.value === '' ? '' : Number(e.target.value)); resetPage(); }} style={selectStyle}>
            <option value="">All Types</option>
            {BRIGADE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Scope */}
          <select value={filterScope} onChange={e => { setFilterScope(e.target.value === '' ? '' : Number(e.target.value)); resetPage(); }} style={selectStyle}>
            <option value="">All Scopes</option>
            {BRIGADE_SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* State */}
          <select value={filterState} onChange={e => { setFilterState(e.target.value); resetPage(); }} style={selectStyle}>
            <option value="">All States</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* City */}
          <input
            type="text"
            placeholder="Filter by city..."
            value={filterCity}
            onChange={e => { setFilterCity(e.target.value); resetPage(); }}
            style={{ ...selectStyle, width: 150, fontSize: '16px' }}
          />

          {/* Sort */}
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as 'alpha' | 'newest'); resetPage(); }} style={selectStyle}>
            <option value="alpha">A → Z</option>
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
          Showing {filtered.length} Brigade{filtered.length !== 1 ? 's' : ''}
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
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
              No Brigades found.
            </p>
            {isLoggedIn && (
              <Link href="/brigade/create" style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#B22234',
                color: '#FFFFFF',
                borderRadius: 4,
                fontFamily: 'Georgia, serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}>
                ★ Create the First Brigade
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginated.map(brigade => (
              <Link
                key={brigade.brigadeId}
                href={`/brigade/${brigade.brigadeId}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: `1px solid ${brigade.isVerified ? '#C5A028' : '#EEEEEE'}`,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    opacity: brigade.isVerified ? 1 : 0.85,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                    alt={brigade.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1B2A4A',
                      }}>
                        {brigade.name}
                      </span>
                      {brigade.isVerified && (
                        <span style={{
                          background: '#C5A028',
                          color: '#1B2A4A',
                          fontFamily: 'Trebuchet MS, sans-serif',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 20,
                        }}>
                          ✓ VERIFIED
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.78rem',
                      color: '#888888',
                    }}>
                      {brigade.typeLabel} · {brigade.scopeLabel}
                      {brigade.brigadeCity && ` · ${brigade.brigadeCity}`}
                      {brigade.brigadeState && `, ${brigade.brigadeState}`}
                    </div>
                    {brigade.description && (
                      <div style={{
                        fontFamily: 'Trebuchet MS, sans-serif',
                        fontSize: '0.82rem',
                        color: '#555555',
                        marginTop: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {brigade.description}
                      </div>
                    )}
                  </div>

                  <div style={{ color: '#C5A028', fontSize: '0.82rem', flexShrink: 0 }}>
                    View →
                  </div>
                </div>
              </Link>
            ))}
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
