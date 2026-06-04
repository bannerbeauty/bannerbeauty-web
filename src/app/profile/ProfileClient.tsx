'use client';

import { useState } from 'react';

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
}: ProfileClientProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [address1, setAddress1] = useState(initialAddress1);
  const [address2, setAddress2] = useState(initialAddress2);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [zipcode, setZipcode] = useState(initialZipcode);
  const [preferredAuth, setPreferredAuth] = useState(initialPreferredAuth);
  const [emailOptin, setEmailOptin] = useState(initialEmailOptin);
  const [smsOptin, setSmsOptin] = useState(initialSmsOptin);

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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Save failed');
      }

      setSaveStatus('success');
      setSaveMessage('Your profile has been updated.');
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#1A1A2E', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold',
            color: '#C5A028', letterSpacing: '2px',
          }}>
            BANNER BEAUTY
          </span>
        </a>
        <a href="/store" style={{
          fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.8rem',
          letterSpacing: '1px', textTransform: 'uppercase', color: '#C5A028',
          textDecoration: 'none',
        }}>
          Store
        </a>
      </header>

      {/* Body */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 16px 60px' }}>
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

          {/* Mailing Address */}
          <section style={{
            background: '#FFFFFF', borderRadius: 8, padding: 28,
            marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={sectionTitleStyle}>Mailing Address</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address Line 1</label>
              <input
                type="text"
                value={address1}
                onChange={e => setAddress1(e.target.value)}
                style={inputStyle}
                placeholder="Street address"
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
                Message and data rates may apply. Reply STOP at any time to opt out.
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
            disabled={saving}
            style={{
              width: '100%', padding: '14px 24px',
              background: saving ? '#AAAAAA' : '#C5A028',
              color: '#FFFFFF', border: 'none', borderRadius: 4,
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1A1A2E', padding: '16px 24px', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem',
          color: '#888888', margin: 0, letterSpacing: '0.5px',
        }}>
          © {new Date().getFullYear()} Banner Beauty · All rights reserved
        </p>
      </footer>
    </div>
  );
}
