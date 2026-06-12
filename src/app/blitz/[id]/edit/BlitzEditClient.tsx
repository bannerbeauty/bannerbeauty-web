'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import type { SidebarData } from '@/lib/community-sidebar';

interface Blitz {
  blitzId: string;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  imageUrl: string;
}

interface Props {
  blitz: Blitz;
  sidebarData: SidebarData | null;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px',
  border: '1.5px solid #DDDDDD', borderRadius: 4,
  color: '#333333', background: '#FFFFFF', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem',
  fontWeight: 700, color: '#555555', marginBottom: 6, display: 'block',
};

const fieldStyle: React.CSSProperties = { marginBottom: 20 };

export default function BlitzEditClient({ blitz, sidebarData }: Props) {
  const router = useRouter();

  const [name, setName] = useState(blitz.name);
  const [description, setDescription] = useState(blitz.description);
  const [dateStart, setDateStart] = useState(blitz.dateStart?.split('T')[0] ?? '');
  const [dateEnd, setDateEnd] = useState(blitz.dateEnd?.split('T')[0] ?? '');
  const [imageUrl, setImageUrl] = useState(blitz.imageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerImageRef = useRef<HTMLInputElement>(null);

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const res = await fetch('/api/blitz/upload-image', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch { console.error('Banner image upload failed'); }
    finally { setBannerUploading(false); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Blitz name is required.'); return; }
    if (!dateStart) { setError('Start date is required.'); return; }
    if (!dateEnd) { setError('End date is required.'); return; }
    if (new Date(dateEnd) <= new Date(dateStart)) { setError('End date must be after start date.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/flows/update-blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blitzId: blitz.blitzId,
          name: name.trim(),
          description: description.trim(),
          dateStart,
          dateEnd,
          imageUrl,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.push(`/blitz/${blitz.blitzId}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const editContent = (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <Link href={`/blitz/${blitz.blitzId}`} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            ❮ Back to Blitz
          </Link>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Edit Blitz
          </h1>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 32 }}>

          {/* Banner image */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Banner Image</label>
            {imageUrl && (
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', height: 120 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <input ref={bannerImageRef} type="file" accept="image/*" onChange={handleBannerImageChange} style={{ display: 'none' }} />
            <button onClick={() => bannerImageRef.current?.click()} disabled={bannerUploading}
              style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}>
              {bannerUploading ? 'Uploading...' : '🖼️ Change Banner'}
            </button>
          </div>

          {/* Name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Blitz Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} maxLength={100} />
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={500} style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {500 - description.length} characters remaining
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>Start Date *</label>
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>End Date *</label>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #B22234', borderRadius: 4, padding: '12px 16px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#B22234', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: 16, background: saving ? '#AAAAAA' : '#B22234', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : '★ Save Blitz'}
          </button>
        </div>
      </div>
    </div>
  );

  if (sidebarData) {
    return (
      <CommunityLayout sidebarData={sidebarData} hideAvatarBar={true}>
        {editContent}
      </CommunityLayout>
    );
  }
  return editContent;
}
