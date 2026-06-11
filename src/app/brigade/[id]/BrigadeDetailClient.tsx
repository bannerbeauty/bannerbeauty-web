'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BrigadeDetail, BrigadeMember, BrigadeBlitz, BrigadeBump } from './page';

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
  brigade: BrigadeDetail;
  members: BrigadeMember[];
  blitzes: BrigadeBlitz[];
  recentBumps: BrigadeBump[];
  membershipStatus: { brigadeneighborid: string; isAdmin: boolean; statuscode: number } | null;
  neighborId: string | null;
  bannerOptionLabels: Record<number, string>;
}

export default function BrigadeDetailClient({
  brigade,
  members,
  blitzes,
  recentBumps,
  membershipStatus,
  neighborId,
  bannerOptionLabels,
}: Props) {
  const [requestSent, setRequestSent] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const isOwner = neighborId === brigade.ownerNeighborId;
  const isAdmin = membershipStatus?.isAdmin ?? false;
  const isMember = membershipStatus?.statuscode === 121120001;
  const isPending = membershipStatus?.statuscode === 1;

  const handleJoinRequest = async () => {
    if (!neighborId) return;
    setRequesting(true);
    try {
      await fetch('/api/flows/brigade-join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brigadeId: brigade.brigadeId,
          neighborId,
        }),
      });
      setRequestSent(true);
    } catch {
      console.error('Join request failed');
    } finally {
      setRequesting(false);
    }
  };

  const scopeDisplay = brigade.countyNameFull
    ? brigade.countyNameFull
    : [brigade.brigadeCity, brigade.brigadeState, brigade.brigadeScopeDescription].filter(Boolean).join(', ');

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh' }}>

      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/brigades" style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 24,
          }}>
            ← All Brigades
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Brigade profile image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
              alt={brigade.name}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #C5A028',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                }}>
                  {brigade.name}
                </h1>
                {brigade.isVerified && (
                  <span style={{
                    background: '#C5A028',
                    color: '#1B2A4A',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    letterSpacing: '0.5px',
                  }}>
                    ✓ VERIFIED
                  </span>
                )}
              </div>

              <div style={{
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.85rem',
                color: '#C5A028',
                marginBottom: 8,
              }}>
                {brigade.typeLabel} · {brigade.scopeLabel}{scopeDisplay ? ` · ${scopeDisplay}` : ''}
              </div>

              {brigade.description && (
                <p style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                  maxWidth: 600,
                }}>
                  {brigade.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {members.length + 1}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Members
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {recentBumps.length === 10 ? '10+' : recentBumps.length}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Bumps
                  </div>
                </div>
                {blitzes.length > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#C5A028' }}>
                      {blitzes.length}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Active Blitz{blitzes.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              {isOwner || isAdmin ? (
                <Link
                  href={`/brigade/${brigade.brigadeId}/edit`}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  ✏️ Edit Brigade
                </Link>
              ) : isMember ? (
                <div style={{
                  padding: '10px 20px',
                  background: 'rgba(197,160,40,0.15)',
                  color: '#C5A028',
                  borderRadius: 4,
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '1px solid #C5A028',
                }}>
                  ★ Member
                </div>
              ) : isPending || requestSent ? (
                <div style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  borderRadius: 4,
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  ⏳ Request Pending
                </div>
              ) : neighborId ? (
                <button
                  onClick={handleJoinRequest}
                  disabled={requesting}
                  style={{
                    padding: '10px 20px',
                    background: '#B22234',
                    color: '#FFFFFF',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: requesting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {requesting ? 'Requesting...' : '★ Request to Join'}
                </button>
              ) : (
                <Link
                  href="/api/auth/signin"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#B22234',
                    color: '#FFFFFF',
                    borderRadius: 4,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Sign In to Join
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

          {/* Left column */}
          <div>

            {/* Active Blitzes */}
            {blitzes.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24, marginBottom: 24 }}>
                <div style={sectionLabelStyle}>★ Active Blitzes</div>
                {blitzes.map(blitz => (
                  <Link
                    key={blitz.blitzId}
                    href={`/blitz/${blitz.blitzId}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #F5F5F5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A' }}>
                          {blitz.name}
                        </div>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 2 }}>
                          {formatDate(blitz.dateStart)} — {formatDate(blitz.dateEnd)}
                        </div>
                      </div>
                      <span style={{ color: '#C5A028', fontSize: '0.82rem' }}>View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Recent Banner Bumps */}
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

          {/* Right column */}
          <div>

            {/* Members */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24, marginBottom: 24 }}>
              <div style={sectionLabelStyle}>★ Members ({members.length + 1})</div>

              {/* Owner */}
              <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brigade.ownerProfileImageUrl || getDefaultAvatar(brigade.ownerNeighborId)}
                    alt="Owner"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A028' }}
                  />
                  <div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A' }}>
                      {brigade.ownerFirstName} {brigade.ownerLastName}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#C5A028', letterSpacing: '0.5px' }}>
                      OWNER
                    </div>
                  </div>
                </div>
              </div>

              {members.map(member => (
                <div key={member.brigadeneighborid} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.profileImageUrl || getDefaultAvatar(member.neighborId)}
                    alt={member.firstName}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#333333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.displayName || `${member.firstName} ${member.lastName}`.trim()}
                    </div>
                    {member.handle && (
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA' }}>
                        @{member.handle}
                      </div>
                    )}
                  </div>
                  {member.isAdmin && (
                    <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#C5A028', fontWeight: 700, letterSpacing: '0.5px', flexShrink: 0 }}>
                      ADMIN
                    </span>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#AAAAAA', margin: 0 }}>
                  No members yet.
                </p>
              )}
            </div>

            {/* Brigade image */}
            {brigade.imageUrl && (
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brigade.imageUrl} alt={brigade.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
