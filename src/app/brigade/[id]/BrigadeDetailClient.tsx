'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import type { SidebarData } from '@/lib/community-sidebar';
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

interface Props {
  brigade: BrigadeDetail;
  members: BrigadeMember[];
  blitzes: BrigadeBlitz[];
  recentBumps: BrigadeBump[];
  membershipStatus: { brigadeneighborid: string; isAdmin: boolean; statuscode: number } | null;
  neighborId: string | null;
  bannerOptionLabels: Record<number, string>;
  pendingBrigades?: BrigadeMember[];
  sidebarData: SidebarData | null;
}

export default function BrigadeDetailClient({
  brigade,
  members,
  blitzes,
  recentBumps,
  membershipStatus,
  neighborId,
  bannerOptionLabels,
  pendingBrigades,
  sidebarData,
}: Props) {
  const [requestSent, setRequestSent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'bumps' | 'members' | 'blitzes'>('bumps');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  const brigadeContent = (
    <div style={{ background: '#FFFFFF', minHeight: '80vh' }}>

      {/* Back link */}
      <div style={{ padding: '12px 20px', background: '#FFFFFF' }}>
        <Link href="/brigades" style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.82rem',
          color: '#888888',
          textDecoration: 'none',
        }}>
          ← All Brigades
        </Link>
      </div>

      {/* Banner image — full width, cropped */}
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#1B2A4A', overflow: 'hidden' }}>
        {brigade.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brigade.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)' }} />
        )}
      </div>

      {/* Profile section */}
      <div style={{ padding: '0 20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 12 }}>
          {/* Profile image — overlaps banner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
            alt={brigade.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '4px solid #FFFFFF', flexShrink: 0 }}
          />
          {/* Action button */}
          <div style={{ marginBottom: 4 }}>
            {isOwner || isAdmin ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  href={`/brigade/${brigade.brigadeId}/edit`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'transparent',
                    color: '#1B2A4A',
                    borderRadius: 20,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #CCCCCC',
                  }}
                >
                  Edit
                </Link>
                <Link
                  href={`/blitz/create?brigadeId=${brigade.brigadeId}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: '#C5A028',
                    color: '#1B2A4A',
                    borderRadius: 20,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  ⚡ Blitz
                </Link>
              </div>
            ) : isMember ? (
              <div style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#1B2A4A',
                borderRadius: 20,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid #CCCCCC',
              }}>
                ★ Member
              </div>
            ) : isPending || requestSent ? (
              <div style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#888888',
                borderRadius: 20,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.82rem',
                border: '1px solid #CCCCCC',
              }}>
                Pending
              </div>
            ) : neighborId ? (
              <button
                onClick={handleJoinRequest}
                disabled={requesting}
                style={{
                  padding: '8px 20px',
                  background: '#1B2A4A',
                  color: '#FFFFFF',
                  borderRadius: 20,
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: requesting ? 'not-allowed' : 'pointer',
                  opacity: requesting ? 0.7 : 1,
                }}
              >
                {requesting ? 'Requesting...' : 'Request to Join'}
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: '#1B2A4A',
                  color: '#FFFFFF',
                  borderRadius: 20,
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Sign In to Join
              </Link>
            )}
          </div>
        </div>

        {/* Name + verified + type */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1B2A4A' }}>{brigade.name}</span>
            {brigade.isVerified && <span style={{ color: '#C5A028', fontSize: '0.8rem', fontWeight: 700 }}>✓ VERIFIED</span>}
          </div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#888888', marginTop: 2 }}>
            {brigade.typeLabel} · {brigade.scopeLabel}{scopeDisplay ? ` · ${scopeDisplay}` : ''}
          </div>
          {brigade.description && (
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#444444', lineHeight: 1.6, margin: '8px 0' }}>
              {brigade.description}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
            <strong style={{ color: '#1B2A4A' }}>{members.length + 1}</strong> Members
          </span>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
            <strong style={{ color: '#1B2A4A' }}>{recentBumps.length === 10 ? '10+' : recentBumps.length}</strong> Bumps
          </span>
          {blitzes.length > 0 && (
            <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
              <strong style={{ color: '#C5A028' }}>{blitzes.length}</strong> Active Blitz{blitzes.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 10 }}>
        {(['bumps', 'members', 'blitzes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #B22234' : '3px solid transparent',
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#B22234' : '#888888',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'bumps' ? 'Bumps' : tab === 'members' ? `Members (${members.length + 1})` : `Blitzes (${blitzes.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* Bumps tab */}
        {activeTab === 'bumps' && (
          <div>
            {recentBumps.length === 0 ? (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', textAlign: 'center', padding: '40px 0' }}>
                No Banner Bumps yet. Be the first!
              </p>
            ) : (
              recentBumps.map(bump => (
                <div key={bump.bannerId} style={{ padding: '14px 0', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#333333' }}>
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
        )}

        {/* Members tab */}
        {activeTab === 'members' && (
          <div>
            {/* Owner first */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brigade.ownerProfileImageUrl || getDefaultAvatar(brigade.ownerNeighborId)}
                alt="Owner"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A028' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                  {brigade.ownerFirstName} {brigade.ownerLastName}
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#C5A028', letterSpacing: '0.5px' }}>OWNER</div>
              </div>
            </div>
            {members.map(member => (
              <div key={member.brigadeneighborid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.profileImageUrl || getDefaultAvatar(member.neighborId)}
                  alt={member.firstName}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>
                    {member.displayName || `${member.firstName} ${member.lastName}`.trim()}
                  </div>
                  {member.handle && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>@{member.handle}</div>}
                  {member.isAdmin && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#C5A028', fontWeight: 700 }}>ADMIN</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blitzes tab */}
        {activeTab === 'blitzes' && (
          <div>
            {blitzes.length === 0 ? (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', textAlign: 'center', padding: '40px 0' }}>
                No active Blitzes.
              </p>
            ) : (
              blitzes.map(blitz => (
                <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '14px 0', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A' }}>{blitz.name}</div>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 2 }}>
                        {formatDate(blitz.dateStart)} — {formatDate(blitz.dateEnd)}
                      </div>
                    </div>
                    <span style={{ color: '#C5A028', fontSize: '0.82rem' }}>View →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Pending requests — owner only */}
        {isOwner && pendingBrigades && pendingBrigades.length > 0 && (
          <div style={{ marginTop: 24, background: '#FFFBEA', border: '1px solid #C5A028', borderRadius: 8, padding: 16 }}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 12, fontWeight: 700 }}>
              ★ Pending Join Requests ({pendingBrigades.length})
            </div>
            {pendingBrigades.map(member => (
              <div key={member.brigadeneighborid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5E8A0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.profileImageUrl || getDefaultAvatar(member.neighborId)}
                  alt={member.firstName}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A' }}>
                    {member.displayName || `${member.firstName} ${member.lastName}`.trim()}
                  </div>
                  {member.handle && <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888' }}>@{member.handle}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );

  if (sidebarData) {
    return (
      <CommunityLayout sidebarData={sidebarData}>
        {brigadeContent}
      </CommunityLayout>
    );
  }
  return brigadeContent;
}
