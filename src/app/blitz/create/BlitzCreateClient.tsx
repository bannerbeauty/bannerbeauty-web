'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  brigadeId: string;
  brigadeName: string;
  neighborId: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '16px',
  border: '1.5px solid #DDDDDD',
  borderRadius: 4,
  color: '#333333',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#555555',
  marginBottom: 6,
  display: 'block',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 20,
};

export default function BlitzCreateClient({ brigadeId, brigadeName, neighborId }: Props) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Blitz name is required.'); return; }
    if (!dateStart) { setError('Start date is required.'); return; }
    if (!dateEnd) { setError('End date is required.'); return; }
    if (new Date(dateEnd) <= new Date(dateStart)) { setError('End date must be after start date.'); return; }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/flows/create-blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          dateStart,
          dateEnd,
          brigadeId,
          ownerNeighborId: neighborId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.blitzId) throw new Error(data.error ?? 'Blitz creation failed');

      router.push(`/blitz/${data.blitzId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link href={`/brigade/${brigadeId}`} style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.82rem',
            color: '#1B2A4A',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 16,
          }}>
            ← Back to {brigadeName}
          </Link>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 8px',
          }}>
            ★ Banner Blitz
          </p>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 10px',
          }}>
            Create a Banner Blitz
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.95rem',
            color: '#666666',
            margin: 0,
            lineHeight: 1.6,
          }}>
            Organize a time-limited Banner Bump campaign for <strong>{brigadeName}</strong> and invite other Brigades to join.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 32 }}>

          {/* Blitz Name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Blitz Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. July 4th Patriot Blitz 2026"
              style={inputStyle}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell participants what this Blitz is about..."
              rows={4}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {500 - description.length} characters remaining
            </div>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>Start Date *</label>
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>End Date *</label>
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Creating Brigade */}
          <div style={{
            background: '#FAF7F2',
            border: '1px solid #EEEEEE',
            borderRadius: 4,
            padding: '12px 16px',
            marginBottom: 20,
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.85rem',
            color: '#555555',
          }}>
            <strong style={{ color: '#1B2A4A' }}>Creating Brigade:</strong> {brigadeName} — this Brigade will be automatically enrolled in the Blitz. Other Brigades can request to join.
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF5F5',
              border: '1px solid #B22234',
              borderRadius: 4,
              padding: '12px 16px',
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              color: '#B22234',
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              background: saving ? '#AAAAAA' : '#B22234',
              color: '#FFFFFF',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 4,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Creating Blitz...' : '★ Launch Banner Blitz'}
          </button>
        </div>
      </div>
    </div>
  );
}
