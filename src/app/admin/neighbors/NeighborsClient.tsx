'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminNeighbor } from './page';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NeighborsClient({ neighbors }: { neighbors: AdminNeighbor[] }) {
  const [search, setSearch] = useState('');
  const [localNeighbors, setLocalNeighbors] = useState(neighbors);
  const [actioning, setActioning] = useState<string | null>(null);

  const filtered = localNeighbors.filter(n => {
    const q = search.toLowerCase();
    return (
      n.firstName.toLowerCase().includes(q) ||
      n.lastName.toLowerCase().includes(q) ||
      n.displayName.toLowerCase().includes(q) ||
      n.handle.toLowerCase().includes(q) ||
      n.phone.includes(q) ||
      n.state.toLowerCase().includes(q)
    );
  });

  const handleToggleAdmin = async (neighborId: string, currentValue: boolean) => {
    setActioning(neighborId);
    try {
      await fetch('/api/admin/neighbor/toggle-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborId, isAdmin: !currentValue }),
      });
      setLocalNeighbors(prev => prev.map(n =>
        n.neighborId === neighborId ? { ...n, isAdmin: !currentValue } : n
      ));
    } catch { console.error('Toggle admin failed'); }
    finally { setActioning(null); }
  };

  const handleDeactivate = async (neighborId: string) => {
    if (!confirm('Are you sure you want to deactivate this neighbor?')) return;
    setActioning(neighborId);
    try {
      await fetch('/api/admin/neighbor/deactivate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborId }),
      });
      setLocalNeighbors(prev => prev.filter(n => n.neighborId !== neighborId));
    } catch { console.error('Deactivate failed'); }
    finally { setActioning(null); }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Neighbors
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, handle, phone, or state..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              fontFamily: 'Trebuchet MS, sans-serif',
              border: '1.5px solid #DDDDDD',
              borderRadius: 6,
              outline: 'none',
              boxSizing: 'border-box',
              background: '#FFFFFF',
            }}
          />
        </div>

        {/* Count */}
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginBottom: 12 }}>
          {filtered.length} of {localNeighbors.length} neighbors
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              No neighbors found.
            </div>
          ) : (
            filtered.map((n, i) => (
              <div key={n.neighborId} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 80px 80px 120px 140px',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : 'none',
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
              }}>

                {/* Name/Handle */}
                <div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                    {n.firstName} {n.lastName}
                    {n.isAdmin && <span style={{ marginLeft: 8, background: '#B22234', color: '#FFFFFF', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>ADMIN</span>}
                    {n.isPatriotsClub && <span style={{ marginLeft: 4, background: '#C5A028', color: '#FFFFFF', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>PC</span>}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                    @{n.handle || '—'} · {n.phone || '—'} · {n.state || '—'}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA' }}>
                    Joined {formatDate(n.createdOn)}
                  </div>
                </div>

                {/* View profile */}
                <Link href={`/neighbor/${n.neighborId}`} target="_blank"
                  style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
                  View →
                </Link>

                {/* State */}
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#555', textAlign: 'center' }}>
                  {n.state || '—'}
                </div>

                {/* PC badge */}
                <div style={{ textAlign: 'center' }}>
                  {n.isPatriotsClub ? (
                    <span style={{ color: '#C5A028', fontWeight: 700, fontSize: '0.82rem' }}>★ PC</span>
                  ) : (
                    <span style={{ color: '#CCCCCC', fontSize: '0.82rem' }}>—</span>
                  )}
                </div>

                {/* Toggle admin */}
                <button
                  onClick={() => handleToggleAdmin(n.neighborId, n.isAdmin)}
                  disabled={actioning === n.neighborId}
                  style={{
                    padding: '6px 12px',
                    background: n.isAdmin ? '#B22234' : '#F5F5F5',
                    color: n.isAdmin ? '#FFFFFF' : '#555555',
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: actioning === n.neighborId ? 'not-allowed' : 'pointer',
                    opacity: actioning === n.neighborId ? 0.6 : 1,
                  }}>
                  {n.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>

                {/* Deactivate */}
                <button
                  onClick={() => handleDeactivate(n.neighborId)}
                  disabled={actioning === n.neighborId}
                  style={{
                    padding: '6px 12px',
                    background: '#FFFFFF',
                    color: '#B22234',
                    border: '1.5px solid #B22234',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: actioning === n.neighborId ? 'not-allowed' : 'pointer',
                    opacity: actioning === n.neighborId ? 0.6 : 1,
                  }}>
                  Deactivate
                </button>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
