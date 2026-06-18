'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminBrigade } from './page';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BrigadesClient({ brigades }: { brigades: AdminBrigade[] }) {
  const [search, setSearch] = useState('');
  const [localBrigades, setLocalBrigades] = useState(brigades);
  const [actioning, setActioning] = useState<string | null>(null);

  const filtered = localBrigades.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleVerified = async (brigadeId: string, current: boolean) => {
    setActioning(brigadeId);
    try {
      await fetch('/api/admin/brigade/toggle-verified', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brigadeId, isVerified: !current }),
      });
      setLocalBrigades(prev => prev.map(b => b.brigadeId === brigadeId ? { ...b, isVerified: !current } : b));
    } catch { console.error('Toggle verified failed'); }
    finally { setActioning(null); }
  };

  const handleDeactivate = async (brigadeId: string) => {
    if (!confirm('Deactivate this brigade?')) return;
    setActioning(brigadeId);
    try {
      await fetch('/api/admin/brigade/deactivate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brigadeId }),
      });
      setLocalBrigades(prev => prev.filter(b => b.brigadeId !== brigadeId));
    } catch { console.error('Deactivate brigade failed'); }
    finally { setActioning(null); }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Brigades
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

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search brigades..."
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '16px',
            fontFamily: 'Trebuchet MS, sans-serif',
            border: '1.5px solid #DDDDDD',
            borderRadius: 6,
            outline: 'none',
            marginBottom: 16,
            boxSizing: 'border-box',
            background: '#FFFFFF',
          }}
        />

        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginBottom: 12 }}>
          {filtered.length} of {localBrigades.length} brigades
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              No brigades found.
            </div>
          ) : (
            filtered.map((b, i) => (
              <div key={b.brigadeId} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 80px 120px 140px',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : 'none',
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
              }}>
                <div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {b.name}
                    {b.isVerified && <span style={{ color: '#1B7A3E', fontSize: '0.78rem' }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                    {b.brigadeTypeLabel} · Created {formatDate(b.createdOn)}
                  </div>
                </div>

                <Link href={`/brigade/${b.brigadeId}`} target="_blank" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
                  View →
                </Link>

                <div style={{ textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#555' }}>
                  {b.memberCount} members
                </div>

                <button
                  onClick={() => handleToggleVerified(b.brigadeId, b.isVerified)}
                  disabled={actioning === b.brigadeId}
                  style={{
                    padding: '6px 12px',
                    background: b.isVerified ? '#1B7A3E' : '#F5F5F5',
                    color: b.isVerified ? '#FFFFFF' : '#555555',
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: actioning === b.brigadeId ? 'not-allowed' : 'pointer',
                    opacity: actioning === b.brigadeId ? 0.6 : 1,
                  }}>
                  {b.isVerified ? '✓ Verified' : 'Verify'}
                </button>

                <button
                  onClick={() => handleDeactivate(b.brigadeId)}
                  disabled={actioning === b.brigadeId}
                  style={{
                    padding: '6px 12px',
                    background: '#FFFFFF',
                    color: '#B22234',
                    border: '1.5px solid #B22234',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: actioning === b.brigadeId ? 'not-allowed' : 'pointer',
                    opacity: actioning === b.brigadeId ? 0.6 : 1,
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
