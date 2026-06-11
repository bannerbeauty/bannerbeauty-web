'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BlitzDetail, BlitzBrigadeItem, BlitzBump, UserBrigade } from './page';

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

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#B22234',
  marginBottom: 16,
  fontWeight: 700,
};

interface Props {
  blitz: BlitzDetail;
  participatingBrigades: BlitzBrigadeItem[];
  pendingBrigades: BlitzBrigadeItem[];
  recentBumps: BlitzBump[];
  userBrigades: UserBrigade[];
  neighborId: string | null;
  bannerOptionLabels: Record<number, string>;
}

export default function BlitzDetailClient({
  blitz,
  participatingBrigades,
  pendingBrigades,
  recentBumps,
  userBrigades,
  neighborId,
  bannerOptionLabels,
}: Props) {
  const [selectedBrigadeId, setSelectedBrigadeId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  const isOwner = neighborId === blitz.ownerNeighborId;

  // Which of user's brigades are already participating or pending
  const participatingIds = new Set(participatingBrigades.map(b => b.brigadeId));
  const pendingIds = new Set(pendingBrigades.map(b => b.brigadeId));
  const eligibleBrigades = userBrigades.filter(b => !participatingIds.has(b.brigadeId) && !pendingIds.has(b.brigadeId));

  const handleJoinRequest = async () => {
    if (!selectedBrigadeId) { setError('Please select a Brigade.'); return; }
    setRequesting(true);
    setError('');
    try {
      await fetch('/api/flows/blitz-join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blitzId: blitz.blitzId,
          brigadeId: selectedBrigadeId,
        }),
      });
      setRequestSent(true);
    } catch {
      setError('Request failed. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh' }}>

      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/blitzes" style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 24,
          }}>
            ← All Blitzes
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                }}>
                  {blitz.name}
                </h1>
                <span style={{
                  background: blitz.statusColor,
                  color: '#FFFFFF',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  letterSpacing: '0.5px',
                }}>
                  {blitz.statusLabel}
                </span>
              </div>

              <div style={{
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                color: '#C5A028',
                marginBottom: 12,
              }}>
                {formatDate(blitz.dateStart)} — {formatDate(blitz.dateEnd)}
              </div>

              {blitz.description && (
                <p style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                  maxWidth: 600,
                }}>
                  {blitz.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {participatingBrigades.length}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Brigade{participatingBrigades.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {recentBumps.length === 20 ? '20+' : recentBumps.length}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Bumps
                  </div>
                </div>
              </div>
            </div>

            {/* Owner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blitz.ownerProfileImageUrl || getDefaultAvatar(blitz.ownerNeighborId)}
                alt="Owner"
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A028' }}
              />
              <div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Organized by
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 700 }}>
                  {blitz.ownerFirstName} {blitz.ownerLastName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

          {/* Left — Leaderboard + Bumps */}
          <div>

            {/* Leaderboard */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24, marginBottom: 24 }}>
              <div style={sectionLabelStyle}>★ Brigade Leaderboard</div>
              {participatingBrigades.length === 0 ? (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', margin: 0 }}>
                  No Brigades participating yet.
                </p>
              ) : (
                participatingBrigades.map((brigade, index) => (
                  <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: '1px solid #F5F5F5',
                    }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: index === 0 ? '#C5A028' : index === 1 ? '#AAAAAA' : index === 2 ? '#B87333' : '#EEEEEE',
                        color: index < 3 ? '#FFFFFF' : '#888888',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brigade.brigadeProfileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                        alt={brigade.brigadeName}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                          {brigade.brigadeName}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#B22234', flexShrink: 0 }}>
                        {brigade.bumpCount} {brigade.bumpCount === 1 ? 'Bump' : 'Bumps'}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Recent Bumps */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24 }}>
              <div style={sectionLabelStyle}>★ Recent Banner Bumps</div>
              {recentBumps.length === 0 ? (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', margin: 0 }}>
                  No Banner Bumps yet. Be the first!
                </p>
              ) : (
                recentBumps.map(bump => (
                  <div key={bump.bannerId} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #F5F5F5',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#333333' }}>
                        {bannerOptionLabels[bump.bannerOption] ?? 'Letter'} · {bump.recipientCity}, {bump.recipientState}
                      </div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', marginTop: 2 }}>
                        {bump.bannerNumber}
                        {bump.brigadeId && participatingBrigades.find(b => b.brigadeId === bump.brigadeId) && (
                          <span style={{ marginLeft: 6, color: '#C5A028' }}>
                            · {participatingBrigades.find(b => b.brigadeId === bump.brigadeId)?.brigadeName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA', flexShrink: 0 }}>
                      {formatDate(bump.createdOn)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right — Join Request + Pending */}
          <div>

            {/* Join Request */}
            {neighborId && eligibleBrigades.length > 0 && !requestSent && (
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24, marginBottom: 24 }}>
                <div style={sectionLabelStyle}>★ Join This Blitz</div>
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Request to join this Blitz with one of your Brigades.
                </p>
                <select
                  value={selectedBrigadeId}
                  onChange={e => setSelectedBrigadeId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.85rem',
                    border: '1.5px solid #DDDDDD',
                    borderRadius: 4,
                    marginBottom: 12,
                    color: '#333333',
                  }}
                >
                  <option value="">Select a Brigade...</option>
                  {eligibleBrigades.map(b => (
                    <option key={b.brigadeId} value={b.brigadeId}>{b.brigadeName}</option>
                  ))}
                </select>
                {error && (
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#B22234', marginBottom: 8 }}>
                    {error}
                  </div>
                )}
                <button
                  onClick={handleJoinRequest}
                  disabled={requesting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: requesting ? '#AAAAAA' : '#B22234',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 4,
                    cursor: requesting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {requesting ? 'Requesting...' : '★ Request to Join'}
                </button>
              </div>
            )}

            {requestSent && (
              <div style={{ background: '#F0FBF4', border: '1px solid #1B7A3E', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#1B7A3E', margin: 0 }}>
                  ✓ Your join request has been sent! The Blitz organizer will review it shortly.
                </p>
              </div>
            )}

            {/* Pending Requests (owner only) */}
            {isOwner && pendingBrigades.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #C5A028', padding: 24, marginBottom: 24 }}>
                <div style={{ ...sectionLabelStyle, color: '#C5A028' }}>★ Pending Requests ({pendingBrigades.length})</div>
                {pendingBrigades.map(brigade => (
                  <div key={brigade.blitzbrigadeid} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: '1px solid #F5F5F5',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brigade.brigadeProfileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                      alt={brigade.brigadeName}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A' }}>
                        {brigade.brigadeName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={async () => {
                          await fetch('/api/flows/blitz-approve-brigade', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ blitzbrigadeid: brigade.blitzbrigadeid, action: 'approve' }),
                          });
                          window.location.reload();
                        }}
                        style={{
                          padding: '4px 10px',
                          background: '#1B7A3E',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 4,
                          fontFamily: 'Trebuchet MS, sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={async () => {
                          await fetch('/api/flows/blitz-approve-brigade', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ blitzbrigadeid: brigade.blitzbrigadeid, action: 'deny' }),
                          });
                          window.location.reload();
                        }}
                        style={{
                          padding: '4px 10px',
                          background: '#B22234',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 4,
                          fontFamily: 'Trebuchet MS, sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Participating Brigades summary */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24 }}>
              <div style={sectionLabelStyle}>★ Participating Brigades</div>
              {participatingBrigades.length === 0 ? (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#AAAAAA', margin: 0 }}>
                  No Brigades yet.
                </p>
              ) : (
                participatingBrigades.map(brigade => (
                  <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brigade.brigadeProfileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                        alt={brigade.brigadeName}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A' }}>
                          {brigade.brigadeName}
                        </div>
                        {brigade.brigadeIsVerified && (
                          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#C5A028' }}>✓ VERIFIED</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
