'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface ProfileClientProps {
  neighborId: string | null;
  userEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  preferredAuth: string;
  emailOptin: boolean;
  smsOptin: boolean;
  displayName: string;
  handle: string;
  profileImageUrl: string | null;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DC', label: 'D.C.' },
  { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const DEFAULT_AVATARS = [
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-eagle.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-star.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-house.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-medal.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-shield.png',
  'https://bannerbeautystorage.blob.core.windows.net/profile-images/default-silhouette.png',
];

function getDefaultAvatar(neighborId: string): string {
  const index = neighborId.charCodeAt(0) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #DDDDDD',
  borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.95rem',
  color: '#2D2D2D', background: '#FFFFFF', boxSizing: 'border-box',
};

const inputReadonlyStyle: React.CSSProperties = {
  ...inputStyle, background: '#F5F5F5', color: '#888888',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'auto' as React.CSSProperties['appearance'],
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem',
  textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', marginBottom: 6,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px',
  textTransform: 'uppercase', color: '#C5A028', marginBottom: 16,
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export default function ProfileClient({
  neighborId,
  userEmail,
  firstName: initialFirstName,
  lastName: initialLastName,
  phone: initialPhone,
  address1: initialAddress1,
  address2: initialAddress2,
  city: initialCity,
  state: initialState,
  zipcode: initialZipcode,
  preferredAuth: initialPreferredAuth,
  emailOptin: initialEmailOptin,
  smsOptin: initialSmsOptin,
  displayName: initialDisplayName,
  handle: initialHandle,
  profileImageUrl: initialProfileImageUrl,
}: ProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('new') === 'true';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [address1, setAddress1] = useState(initialAddress1);
  const [address2, setAddress2] = useState(initialAddress2);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [zipcode, setZipcode] = useState(initialZipcode);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [preferredAuth, setPreferredAuth] = useState(initialPreferredAuth);
  const [emailOptin, setEmailOptin] = useState(initialEmailOptin);
  const [smsOptin, setSmsOptin] = useState(initialSmsOptin);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '');
  const [handle, setHandle] = useState(initialHandle ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(initialProfileImageUrl ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);

  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!handle || handle === initialHandle || handle.length < 3) {
      setHandleStatus('idle');
      return;
    }
    setHandleStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ handle });
        if (neighborId) params.set('neighborId', neighborId);
        const res = await fetch(`/api/profile/check-handle?${params}`);
        const data = await res.json() as { available: boolean };
        setHandleStatus(data.available ? 'available' : 'taken');
      } catch {
        setHandleStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handle, initialHandle, neighborId]);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const res = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await res.json();
      if (data.url) setProfileImageUrl(data.url);
    } catch {
      console.error('Profile image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  async function handleSave() {
    setSaving(true);
    setSaveStatus('idle');
    setSaveMessage('');

    try {
      const res = await fetch('/api/flows/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: JSON.stringify({
            neighborId,
            email: userEmail,
            firstName,
            lastName,
            phone,
            address1,
            address2,
            city,
            state,
            zipcode,
            preferredAuth: Number(preferredAuth),
            emailOptin,
            smsOptin,
            lat,
            lng,
            displayName,
            handle,
            profileImageUrl,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Save failed');
      }

      setSaveStatus('success');
      setSaveMessage('Your profile has been updated.');
      if (isNewUser) {
        setTimeout(() => {
          router.push('/community');
        }, 1200);
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
    <div style={{ background: '#F9F6F0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px 60px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          {/* Page title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div>
            <h1 style={{
              fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#1A1A2E',
              margin: '0 0 8px',
            }}>
              My Profile
            </h1>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', color: '#666', fontSize: '0.9rem', margin: 0 }}>
              Keep your information up to date
            </p>
          </div>

          {/* Personal Information */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={inputStyle}
                  placeholder="First name"
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={inputStyle}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                style={inputReadonlyStyle}
              />
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem',
                color: '#AAAAAA', margin: '6px 0 0', letterSpacing: '0.3px',
              }}>
                Email is managed by your login account and cannot be changed here.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                style={inputStyle}
                placeholder="(555) 555-5555"
                maxLength={14}
              />
            </div>
          </section>

          {/* Profile Image */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImageUrl || getDefaultAvatar(neighborId ?? '')}
                  alt="Profile"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #C5A028',
                  }}
                />
                {imageUploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(27,42,74,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontFamily: 'Trebuchet MS, sans-serif',
                  }}>
                    Uploading...
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 8 }}>
                  {displayName || `${firstName} ${lastName}`.trim() || 'Your Name'}
                </div>
                {handle && (
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888', marginBottom: 12 }}>
                    @{handle}
                  </div>
                )}
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => profileImageRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    background: '#FFFFFF',
                    border: '1.5px solid #1B2A4A',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1B2A4A',
                    cursor: 'pointer',
                  }}
                >
                  {profileImageUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </section>

          {/* Public Identity */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Public Identity</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={inputStyle}
                placeholder="Your public name"
              />
            </div>
            <div>
              <label style={labelStyle}>Handle</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #DDDDDD', borderRadius: 4, overflow: 'hidden', background: '#FFFFFF' }}>
                <span style={{
                  padding: '10px 12px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  color: '#888888',
                  background: '#F5F5F5',
                  borderRight: '1.5px solid #DDDDDD',
                  userSelect: 'none',
                }}>@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }}
                  placeholder="your_handle"
                />
              </div>
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem',
                color: '#AAAAAA', margin: '6px 0 0', letterSpacing: '0.3px',
              }}>
                Your unique public identifier on Banner Beauty. Letters, numbers, and underscores only.
              </p>
              {handleStatus === 'checking' && (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', margin: '6px 0 0' }}>
                  Checking availability…
                </p>
              )}
              {handleStatus === 'available' && (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#2E7D32', margin: '6px 0 0' }}>
                  ✓ @{handle} is available
                </p>
              )}
              {handleStatus === 'taken' && (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#C62828', margin: '6px 0 0' }}>
                  ✗ @{handle} is already taken
                </p>
              )}
            </div>
          </section>

          {/* Mailing Address */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Mailing Address</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address Line 1</label>
              <AddressAutocomplete
                placeholder="Start typing your address..."
                defaultValue={address1}
                onAddressSelect={(addr) => {
                  setAddress1(addr.address1);
                  setCity(addr.city);
                  setState(addr.state);
                  setZipcode(addr.zipcode);
                  setLat(addr.lat);
                  setLng(addr.lng);
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address Line 2 <span style={{ color: '#BBBBBB' }}>(optional)</span></label>
              <input
                type="text"
                value={address2}
                onChange={e => setAddress2(e.target.value)}
                style={inputStyle}
                placeholder="Apt, suite, unit, etc."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={inputStyle}
                  placeholder="City"
                />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">—</option>
                  {US_STATES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ZIP Code</label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={e => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  style={inputStyle}
                  placeholder="00000"
                  maxLength={5}
                />
              </div>
            </div>
          </section>

          {/* Security */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Security</div>
            <div>
              <label style={labelStyle}>Preferred Verification Method</label>
              <select
                value={preferredAuth}
                onChange={e => setPreferredAuth(e.target.value)}
                style={selectStyle}
              >
                <option value="121120000">Email</option>
                <option value="121120001">SMS / Text</option>
              </select>
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem',
                color: '#AAAAAA', margin: '6px 0 0', letterSpacing: '0.3px',
              }}>
                How you&apos;ll receive one-time verification codes when logging in.
              </p>
            </div>
          </section>

          {/* Communication Preferences */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Communication Preferences</div>

            {/* Email opt-in */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: 16, marginBottom: 20,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1A1A2E', marginBottom: 4,
                }}>
                  Email Updates
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666' }}>
                  Receive order confirmations, receipts, and Banner Beauty news by email.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailOptin(v => !v)}
                aria-pressed={emailOptin}
                style={{
                  flexShrink: 0, width: 52, height: 28, borderRadius: 14,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  background: emailOptin ? '#C5A028' : '#CCCCCC',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: emailOptin ? 27 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* SMS opt-in */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: 16, marginBottom: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1A1A2E', marginBottom: 4,
                }}>
                  Text / SMS Updates
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666' }}>
                  Receive order updates and time-sensitive notifications by text message.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSmsOptin(v => !v)}
                aria-pressed={smsOptin}
                style={{
                  flexShrink: 0, width: 52, height: 28, borderRadius: 14,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  background: smsOptin ? '#C5A028' : '#CCCCCC',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: smsOptin ? 27 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {smsOptin && (
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA',
                margin: 0, lineHeight: 1.6, letterSpacing: '0.2px',
              }}>
                By enabling SMS, you consent to receive automated text messages from Banner Beauty.
                Message frequency may vary. Message and data rates may apply. Reply STOP at any time to opt out or HELP for assistance.
              </p>
            )}
          </section>

          {/* Save feedback */}
          {saveStatus === 'success' && (
            <div style={{
              background: '#E8F5E9', border: '1px solid #81C784', borderRadius: 6,
              padding: '12px 16px', marginBottom: 20,
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#2E7D32',
            }}>
              ✓ {saveMessage}
            </div>
          )}
          {saveStatus === 'error' && (
            <div style={{
              background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 6,
              padding: '12px 16px', marginBottom: 20,
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#C62828',
            }}>
              ✗ {saveMessage}
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || handleStatus === 'taken'}
            style={{
              width: '100%', padding: '14px 24px',
              background: saving || handleStatus === 'taken' ? '#AAAAAA' : '#C5A028',
              color: '#FFFFFF', border: 'none', borderRadius: 4,
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: saving || handleStatus === 'taken' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}
