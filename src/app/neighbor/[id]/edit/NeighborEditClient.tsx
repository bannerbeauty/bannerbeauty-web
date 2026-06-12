'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import type { SidebarData } from '@/lib/community-sidebar';

interface Neighbor {
  neighborId: string;
  displayName: string;
  handle: string;
  description: string;
  profileImageUrl: string;
  imageUrl: string;
}

interface Props {
  neighbor: Neighbor;
  sidebarData: SidebarData | null;
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

const fieldStyle: React.CSSProperties = { marginBottom: 20 };

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

export default function NeighborEditClient({ neighbor, sidebarData }: Props) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(neighbor.displayName);
  const [handle, setHandle] = useState(neighbor.handle);
  const [description, setDescription] = useState(neighbor.description);
  const [profileImageUrl, setProfileImageUrl] = useState(neighbor.profileImageUrl);
  const [imageUrl, setImageUrl] = useState(neighbor.imageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageUploading(true);
    try {
      const res = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await res.json();
      if (data.url) setProfileImageUrl(data.url);
    } catch { console.error('Profile image upload failed'); }
    finally { setProfileImageUploading(false); }
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerImageUploading(true);
    try {
      const res = await fetch('/api/neighbor/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch { console.error('Banner image upload failed'); }
    finally { setBannerImageUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/flows/update-neighbor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborId: neighbor.neighborId,
          displayName: displayName.trim(),
          handle: handle.trim(),
          description: description.trim(),
          profileImageUrl,
          imageUrl,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.push(`/neighbor/${neighbor.neighborId}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const editContent = (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href={`/neighbor/${neighbor.neighborId}`} style={{
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem',
            color: '#1B2A4A', textDecoration: 'none', display: 'inline-block', marginBottom: 16,
          }}>
            ❮ Back to Profile
          </Link>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Edit Profile
          </h1>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 32 }}>

          {/* Profile image preview + upload */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileImageUrl || getDefaultAvatar(neighbor.neighborId)}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C5A028' }}
              />
              <div>
                <input ref={profileImageRef} type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                <button
                  onClick={() => profileImageRef.current?.click()}
                  disabled={profileImageUploading}
                  style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}
                >
                  {profileImageUploading ? 'Uploading...' : '📷 Change Photo'}
                </button>
              </div>
            </div>
          </div>

          {/* Banner image preview + upload */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Banner Image</label>
            {imageUrl && (
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', height: 120 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <input ref={bannerImageRef} type="file" accept="image/*" onChange={handleBannerImageChange} style={{ display: 'none' }} />
            <button
              onClick={() => bannerImageRef.current?.click()}
              disabled={bannerImageUploading}
              style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}
            >
              {bannerImageUploading ? 'Uploading...' : '🖼️ Change Banner'}
            </button>
          </div>

          {/* Display Name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle} maxLength={50} />
          </div>

          {/* Handle */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Handle</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888', fontFamily: 'Trebuchet MS, sans-serif' }}>@</span>
              <input type="text" value={handle} onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} style={{ ...inputStyle, paddingLeft: 28 }} maxLength={30} />
            </div>
          </div>

          {/* Bio */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Tell the community about yourself..."
            />
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {500 - description.length} characters remaining
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #B22234', borderRadius: 4, padding: '12px 16px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#B22234', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', padding: 16, background: saving ? '#AAAAAA' : '#B22234', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving...' : '★ Save Profile'}
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
