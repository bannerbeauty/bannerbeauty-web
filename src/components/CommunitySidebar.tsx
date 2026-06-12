'use client';

import Link from 'next/link';
import type { SidebarData } from '@/lib/community-sidebar';

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

function daysRemaining(dateEnd: string): number {
  if (!dateEnd) return 0;
  const end = new Date(dateEnd);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#B22234',
  marginBottom: 12,
  fontWeight: 700,
};

interface Props {
  data: SidebarData;
  onNavigate?: () => void; // called when a link is tapped (closes mobile panel)
}

export default function CommunitySidebar({ data, onNavigate }: Props) {
  const { neighbor, myBrigades, myBlitzes, suggestedBrigades } = data;

  return (
    <div style={{ padding: '20px 16px 48px' }}>
      {/* Profile card */}
      <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #EEEEEE' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={neighbor.profileImageUrl || getDefaultAvatar(neighbor.neighborId)}
          alt="Profile"
          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C5A028', marginBottom: 8 }}
        />
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A' }}>
          {neighbor.displayName || `${neighbor.firstName} ${neighbor.lastName}`.trim()}
        </div>
        {neighbor.handle && (
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 2 }}>
            @{neighbor.handle}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A' }}>{myBrigades.length}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Brigades</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A' }}>{myBlitzes.length}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Blitzes</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <Link href="/submit-banner" onClick={onNavigate} style={{ display: 'block', padding: '11px', background: '#B22234', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', textDecoration: 'none', textAlign: 'center' }}>
          ★ Banner Bump
        </Link>
        <Link href="/store" onClick={onNavigate} style={{ display: 'block', padding: '9px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
          Visit Store
        </Link>
        <Link href="/brigade/create" onClick={onNavigate} style={{ display: 'block', padding: '9px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
          Create a Brigade
        </Link>
        <Link href="/profile" onClick={onNavigate} style={{ display: 'block', padding: '9px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
          Edit Profile
        </Link>
        <Link href="/my-activity" onClick={onNavigate} style={{ display: 'block', padding: '9px', background: '#FAF7F2', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
          My Activity
        </Link>
      </div>

      {/* My Brigades */}
      {myBrigades.length > 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #EEEEEE' }}>
          <div style={sectionLabelStyle}>My Brigades</div>
          {myBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} onClick={onNavigate} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                  alt={brigade.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {brigade.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* My Blitzes */}
      {myBlitzes.length > 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #EEEEEE' }}>
          <div style={sectionLabelStyle}>My Blitzes</div>
          {myBlitzes.map(blitz => (
            <Link key={blitz.blitzId} href={`/blitz/${blitz.blitzId}`} onClick={onNavigate} style={{ textDecoration: 'none' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', fontWeight: 600 }}>
                  {blitz.name}
                </div>
                {blitz.statusCode === 121120001 && (
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#B22234' }}>
                    {daysRemaining(blitz.dateEnd)} days left
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Suggested Brigades */}
      {suggestedBrigades.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabelStyle}>★ Suggested Brigades</div>
          {suggestedBrigades.map(brigade => (
            <Link key={brigade.brigadeId} href={`/brigade/${brigade.brigadeId}`} onClick={onNavigate} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brigade.profileImageUrl || getDefaultAvatar(brigade.brigadeId)}
                  alt={brigade.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {brigade.name}
                  </div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#888888' }}>
                    {brigade.typeLabel}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Browse links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link href="/brigades" onClick={onNavigate} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028', textDecoration: 'none' }}>
          Browse all Brigades →
        </Link>
        <Link href="/blitzes" onClick={onNavigate} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028', textDecoration: 'none' }}>
          Browse all Blitzes →
        </Link>
      </div>
    </div>
  );
}
