'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'phone' | 'code' | 'register';

export default function SignInClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
    if (digits.length === 10) return `+1${digits}`;
    return `+${digits}`;
  };

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const formatted = formatPhone(phone);
      const res = await fetch('/api/sinch/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formatted }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send code. Please try again.');
        return;
      }
      setVerificationId(data.id);
      setPhone(formatted);
      setStep('code');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, code, verificationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Invalid code. Please try again.');
        return;
      }
      if (data.newUser) {
        setStep('register');
      } else {
        router.push('/community');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, firstName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.');
        return;
      }
      router.push('/profile');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontFamily: 'Trebuchet MS, sans-serif',
    border: '1.5px solid #DDDDDD',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 12,
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    background: '#B22234',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#B22234', marginBottom: 8 }}>
            Banner Beauty
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            {step === 'phone' ? 'Sign In or Sign Up' : step === 'code' ? 'Enter Your Code' : 'Welcome, Patriot!'}
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888', marginTop: 8 }}>
            {step === 'phone' ? 'Enter your mobile number to get started.' : step === 'code' ? `We sent a code to ${phone}` : 'Tell us a little about yourself.'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '28px 24px' }}>

          {/* Step 1 — Phone */}
          {step === 'phone' && (
            <>
              <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(805) 555-1234"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              />
              {error && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>}
              <button onClick={handleSendCode} disabled={loading || !phone.trim()} style={buttonStyle}>
                {loading ? 'Sending...' : '★ Send Verification Code'}
              </button>
            </>
          )}

          {/* Step 2 — Code */}
          {step === 'code' && (
            <>
              <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter code"
                maxLength={6}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                autoFocus
              />
              {error && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>}
              <button onClick={handleVerifyCode} disabled={loading || code.length < 4} style={buttonStyle}>
                {loading ? 'Verifying...' : '★ Verify Code'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#888888', cursor: 'pointer', marginTop: 8 }}
              >
                ← Use a different number
              </button>
            </>
          )}

          {/* Step 3 — Register */}
          {step === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                <div>
                  <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="John"
                    style={{ ...inputStyle, marginBottom: 0 }}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Smith"
                    style={{ ...inputStyle, marginBottom: 0 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                  Email <span style={{ color: '#AAAAAA' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={inputStyle}
                />
              </div>
              {error && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>}
              <button onClick={handleRegister} disabled={loading || !firstName.trim() || !lastName.trim()} style={buttonStyle}>
                {loading ? 'Creating account...' : '★ Join Banner Beauty'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA', marginTop: 24 }}>
          By continuing, you agree to our{' '}
          <a href="/terms" style={{ color: '#1B2A4A' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#1B2A4A' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
