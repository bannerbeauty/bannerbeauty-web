'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import CityAutocomplete from '@/components/CityAutocomplete';

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

interface County {
  bb_countyid: string;
  bb_countyname: string;
  bb_countynamefull: string;
}

interface Props {
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

export default function BrigadeCreateClient({ neighborId }: Props) {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [brigadeType, setBrigadeType] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [brigadeScope, setBrigadeScope] = useState<number | ''>('');
  const [brigadeState, setBrigadeState] = useState('');
  const [counties, setCounties] = useState<County[]>([]);
  const [brigadeCountyId, setBrigadeCountyId] = useState('');
  const [brigadeCity, setBrigadeCity] = useState('');
  const [brigadeCounty, setBrigadeCounty] = useState('');
  const [brigadeScopeDescription, setBrigadeScopeDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      console.error('County fetch failed');
    }
  }, [brigadeScope]);

  const handleScopeChange = useCallback((scope: number) => {
    setBrigadeScope(scope);
    setBrigadeState('');
    setBrigadeCountyId('');
    setBrigadeCity('');
    setBrigadeScopeDescription('');
    setCounties([]);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Brigade name is required.'); return; }
    if (brigadeType === '') { setError('Please select a brigade type.'); return; }
    if (brigadeScope === '') { setError('Please select a brigade scope.'); return; }

    setSaving(true);
    setError('');

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        const uploadRes = await fetch('/api/brigade/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': imageFile.type },
          body: imageFile,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Image upload failed');
        imageUrl = uploadData.url;
      }

      // Create brigade
      const res = await fetch('/api/flows/create-brigade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brigadeType,
          description: description.trim(),
          brigadeScope,
          brigadeState,
          ...(brigadeCountyId ? { brigadeCountyId } : {}),
          brigadeCity,
          brigadeScopeDescription: brigadeScopeDescription.trim(),
          imageUrl,
          ownerNeighborId: neighborId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.brigadeId) throw new Error(data.error ?? 'Brigade creation failed');

      router.push(`/brigade/${data.brigadeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
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
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 10px',
          }}>
            Create a Banner Brigade
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.95rem',
            color: '#666666',
            margin: 0,
            lineHeight: 1.6,
          }}>
            Organize your community, department, or group to Banner Bump together.
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 32 }}>

          {/* Brigade Name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Paso Robles Fire Department"
              style={inputStyle}
              maxLength={100}
            />
          </div>

          {/* Brigade Type */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Type *</label>
            <select
              value={brigadeType}
              onChange={e => setBrigadeType(Number(e.target.value))}
              style={inputStyle}
            >
              <option value="">Select a type...</option>
              {BRIGADE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell us about your Brigade..."
              rows={4}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {500 - description.length} characters remaining
            </div>
          </div>

          {/* Brigade Scope */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Scope *</label>
            <select
              value={brigadeScope}
              onChange={e => handleScopeChange(Number(e.target.value))}
              style={inputStyle}
            >
              <option value="">Select a scope...</option>
              {BRIGADE_SCOPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* State dropdown — Statewide or Countywide */}
          {showState && (
            <div style={fieldStyle}>
              <label style={labelStyle}>State *</label>
              <select
                value={brigadeState}
                onChange={e => handleStateChange(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a state...</option>
                {US_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* County dropdown — Countywide only */}
          {showCounty && brigadeState && (
            <div style={fieldStyle}>
              <label style={labelStyle}>County *</label>
              <select
                value={brigadeCountyId}
                onChange={e => setBrigadeCountyId(e.target.value)}
                style={inputStyle}
                disabled={counties.length === 0}
              >
                <option value="">{counties.length === 0 ? 'Loading counties...' : 'Select a county...'}</option>
                {counties.map(c => (
                  <option key={c.bb_countyid} value={c.bb_countyid}>{c.bb_countynamefull}</option>
                ))}
              </select>
            </div>
          )}

          {/* City — Google Places autocomplete */}
          {showCity && (
            <div style={fieldStyle}>
              <label style={labelStyle}>City *</label>
              <CityAutocomplete
                value={brigadeCity}
                onChange={setBrigadeCity}
                onSelect={(data) => {
                  setBrigadeCity(data.city);
                  setBrigadeState(data.state);
                  setBrigadeCounty(data.county);
                }}
                placeholder="Start typing a city..."
              />
            </div>
          )}

          {/* Scope Description — Neighborhood or Custom */}
          {showScopeDesc && (
            <div style={fieldStyle}>
              <label style={labelStyle}>
                {brigadeScope === 121120004 ? 'Neighborhood Description' : 'Custom Area Description'}
              </label>
              <input
                type="text"
                value={brigadeScopeDescription}
                onChange={e => setBrigadeScopeDescription(e.target.value)}
                placeholder={brigadeScope === 121120004 ? 'e.g. Oak Hills neighborhood' : 'e.g. 13th Street from Lincoln to Washington'}
                style={inputStyle}
                maxLength={200}
              />
            </div>
          )}

          {/* Image Upload */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Brigade Image (optional)</label>
            {imagePreview && (
              <div style={{ marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #EEEEEE' }} />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                background: '#FFFFFF',
                border: '1.5px solid #1B2A4A',
                borderRadius: 4,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1B2A4A',
                cursor: 'pointer',
              }}
            >
              {imageFile ? '📷 Change Image' : '📷 Upload Image'}
            </button>
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
            {saving ? 'Creating Brigade...' : '★ Create Banner Brigade'}
          </button>

        </div>
      </div>
    </div>
    </APIProvider>
  );
}
