'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import type { SidebarData } from '@/lib/community-sidebar';

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
  { label: 'Alabama', value: 'AL' }, { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' }, { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' }, { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' }, { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' }, { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' }, { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' }, { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' }, { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' }, { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' }, { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' }, { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' }, { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' }, { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' }, { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' }, { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' }, { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' }, { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' }, { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' }, { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' }, { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' }, { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' }, { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' }, { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' }, { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' }, { label: 'Wyoming', value: 'WY' },
  { label: 'District of Columbia', value: 'DC' },
];

interface Brigade {
  brigadeId: string;
  name: string;
  description: string;
  brigadeType: number | '';
  brigadeScope: number | '';
  brigadeState: string;
  brigadeCountyId: string;
  brigadeCountyName: string;
  brigadeCity: string;
  brigadeScopeDescription: string;
  profileImageUrl: string;
  imageUrl: string;
}

interface County {
  bb_countyid: string;
  bb_countyname: string;
  bb_countynamefull: string;
}

interface Props {
  brigade: Brigade;
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

export default function BrigadeEditClient({ brigade, sidebarData }: Props) {
  const router = useRouter();

  const [name, setName] = useState(brigade.name);
  const [description, setDescription] = useState(brigade.description);
  const [brigadeType, setBrigadeType] = useState<number | ''>(brigade.brigadeType);
  const [brigadeScope, setBrigadeScope] = useState<number | ''>(brigade.brigadeScope);
  const [brigadeState, setBrigadeState] = useState(brigade.brigadeState);
  const [brigadeCountyId, setBrigadeCountyId] = useState(brigade.brigadeCountyId);
  const [brigadeCity, setBrigadeCity] = useState(brigade.brigadeCity);
  const [brigadeScopeDescription, setBrigadeScopeDescription] = useState(brigade.brigadeScopeDescription);
  const [profileImageUrl, setProfileImageUrl] = useState(brigade.profileImageUrl);
  const [imageUrl, setImageUrl] = useState(brigade.imageUrl);
  const [counties, setCounties] = useState<County[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const showState = brigadeScope === 121120001 || brigadeScope === 121120002;
  const showCounty = brigadeScope === 121120002;
  const showCity = brigadeScope === 121120003 || brigadeScope === 121120004;
  const showScopeDesc = brigadeScope === 121120004 || brigadeScope === 121120005;

  const handleStateChange = useCallback(async (state: string) => {
    setBrigadeState(state);
    setBrigadeCountyId('');
    setCounties([]);
    if (!state || brigadeScope !== 121120002) return;
    try {
      const res = await fetch(`/api/counties?state=${state}`);
      const data = await res.json();
      setCounties(data.counties ?? []);
    } catch { console.error('County fetch failed'); }
  }, [brigadeScope]);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileUploading(true);
    try {
      const res = await fetch('/api/brigade/upload-image', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const data = await res.json();
      if (data.url) setProfileImageUrl(data.url);
    } catch { console.error('Profile image upload failed'); }
    finally { setProfileUploading(false); }
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const res = await fetch('/api/brigade/upload-image', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch { console.error('Banner image upload failed'); }
    finally { setBannerUploading(false); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Brigade name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/flows/update-brigade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brigadeId: brigade.brigadeId,
          name: name.trim(),
          description: description.trim(),
          brigadeType,
          brigadeScope,
          brigadeState,
          brigadeCountyId,
          brigadeCity,
          brigadeScopeDescription: brigadeScopeDescription.trim(),
          profileImageUrl,
          imageUrl,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.push(`/brigade/${brigade.brigadeId}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const editContent = (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <Link href={`/brigade/${brigade.brigadeId}`} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            ❮ Back to Brigade
          </Link>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Edit Brigade
          </h1>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 32 }}>

          {/* Profile image */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Profile Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profileImageUrl || ''} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C5A028' }} />
              <div>
                <input ref={profileImageRef} type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                <button onClick={() => profileImageRef.current?.click()} disabled={profileUploading}
                  style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}>
                  {profileUploading ? 'Uploading...' : '📷 Change Photo'}
                </button>
              </div>
            </div>
          </div>

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
            <label style={labelStyle}>Brigade Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} maxLength={100} />
          </div>

          {/* Type */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Type</label>
            <select value={brigadeType} onChange={e => setBrigadeType(Number(e.target.value))} style={inputStyle}>
              <option value="">Select a type...</option>
              {BRIGADE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={500} style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {500 - description.length} characters remaining
            </div>
          </div>

          {/* Scope */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Scope</label>
            <select value={brigadeScope} onChange={e => { setBrigadeScope(Number(e.target.value)); setBrigadeState(''); setBrigadeCountyId(''); setBrigadeCity(''); setCounties([]); }} style={inputStyle}>
              <option value="">Select a scope...</option>
              {BRIGADE_SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* State */}
          {showState && (
            <div style={fieldStyle}>
              <label style={labelStyle}>State</label>
              <select value={brigadeState} onChange={e => handleStateChange(e.target.value)} style={inputStyle}>
                <option value="">Select a state...</option>
                {US_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}

          {/* County */}
          {showCounty && brigadeState && (
            <div style={fieldStyle}>
              <label style={labelStyle}>County</label>
              <select value={brigadeCountyId} onChange={e => setBrigadeCountyId(e.target.value)} style={inputStyle} disabled={counties.length === 0}>
                <option value="">{counties.length === 0 ? 'Loading counties...' : 'Select a county...'}</option>
                {counties.map(c => <option key={c.bb_countyid} value={c.bb_countyid}>{c.bb_countyname}</option>)}
              </select>
            </div>
          )}

          {/* City */}
          {showCity && (
            <div style={fieldStyle}>
              <label style={labelStyle}>City</label>
              <input type="text" value={brigadeCity} onChange={e => setBrigadeCity(e.target.value)} style={inputStyle} />
            </div>
          )}

          {/* Scope description */}
          {showScopeDesc && (
            <div style={fieldStyle}>
              <label style={labelStyle}>{brigadeScope === 121120004 ? 'Neighborhood Description' : 'Custom Area Description'}</label>
              <input type="text" value={brigadeScopeDescription} onChange={e => setBrigadeScopeDescription(e.target.value)} style={inputStyle} maxLength={200} />
            </div>
          )}

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #B22234', borderRadius: 4, padding: '12px 16px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#B22234', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: 16, background: saving ? '#AAAAAA' : '#B22234', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : '★ Save Brigade'}
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
