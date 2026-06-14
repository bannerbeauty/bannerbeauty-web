'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/app/api/feed/route';

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

function NeighborAvatar({ src, neighborId, isPatriotsClub, size = 40 }: { src: string; neighborId: string; isPatriotsClub?: boolean; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || getDefaultAvatar(neighborId)}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
      {isPatriotsClub && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: Math.round(size * 0.35),
          height: Math.round(size * 0.35),
          background: '#FFFFFF',
          borderRadius: '50%',
          border: '1.5px solid #EEEEEE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.28),
          lineHeight: 1,
          color: '#C5A028',
        }}>
          ★
        </div>
      )}
    </div>
  );
}

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
};

interface Props {
  item: FeedItem & { relativeTime: string; bannerOptionLabel: string };
}

export default function FeedItemCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false);

  const avatar = item.profileImageUrl || getDefaultAvatar(item.neighborId);
  const name = item.displayName || item.inFirstName || 'A Fellow Patriot';

  // Feed item header
  const header = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    }}>
      {/* Avatar */}
      {item.neighborId ? (
        <Link href={`/neighbor/${item.neighborId}`}>
          <NeighborAvatar src={avatar} neighborId={item.neighborId} isPatriotsClub={item.isPatriotsClub} />
        </Link>
      ) : (
        <NeighborAvatar src={avatar} neighborId="" />
      )}

      {/* Name + handle + time */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* Screen name */}
        <span style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#1B2A4A',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 140,
        }}>
          {name}
        </span>

        {/* Verified shield */}
        {item.isVerified && (
          <span style={{ color: '#C5A028', fontSize: '0.85rem', flexShrink: 0 }} title="Verified">✓</span>
        )}

        {/* Handle */}
        {item.handle && (
          <span style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.78rem',
            color: '#AAAAAA',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 100,
          }}>
            @{item.handle}
          </span>
        )}
      </div>

      {/* Relative time — always far right */}
      <span style={{
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '0.75rem',
        color: '#AAAAAA',
        flexShrink: 0,
        marginLeft: 'auto',
      }}>
        {item.relativeTime}
      </span>
    </div>
  );

  // ── BUMP ────────────────────────────────────────────────────────────────────
  if (item.type === 'bump') {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', marginBottom: 12 }}>
        {header}
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#333333', marginBottom: 4 }}>
          <span style={{ color: '#B22234', fontWeight: 700 }}>★ Banner Bumped</span> a neighbor in{' '}
          <strong>{item.recipientCity}, {item.recipientState}</strong>
        </div>
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA' }}>
          {item.bannerOptionLabel}
          {item.brigadeName && item.brigadeId && (
            <Link href={`/brigade/${item.brigadeId}`} style={{ color: '#C5A028', textDecoration: 'none', marginLeft: 6 }}>
              · {item.brigadeName}
            </Link>
          )}
          {item.blitzName && <span style={{ marginLeft: 6, color: '#1B7A3E' }}>· {item.blitzName}</span>}
        </div>
        {(item.beforePhotoUrl || item.afterPhotoUrl) && (
          <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            {item.beforePhotoUrl && (
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#888888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Before</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.beforePhotoUrl} alt="Before" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6 }} />
              </div>
            )}
            {item.afterPhotoUrl && (
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', color: '#888888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>After</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.afterPhotoUrl} alt="After" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6 }} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── BRIGADE BUMP ─────────────────────────────────────────────────────────────
  if (item.type === 'brigade_bump') {
    const brigadeAvatar = item.brigadeProfileImageUrl || getDefaultAvatar(item.brigadeId);
    const brigadeHeader = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Link href={`/brigade/${item.brigadeId}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brigadeAvatar} alt={item.brigadeName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #EEEEEE', display: 'block' }} />
        </Link>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link href={`/brigade/${item.brigadeId}`} style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, textDecoration: 'none' }}>
            {item.brigadeName}
          </Link>
          {item.isVerified && <span style={{ color: '#C5A028', fontSize: '0.85rem', flexShrink: 0 }} title="Verified">✓</span>}
        </div>
        <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA', flexShrink: 0, marginLeft: 'auto' }}>
          {item.relativeTime}
        </span>
      </div>
    );
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #C5A028', padding: '16px 20px', marginBottom: 12 }}>
        {brigadeHeader}
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#333333', marginBottom: 4 }}>
          <span style={{ color: '#C5A028', fontWeight: 700 }}>⚡ Blitz Bump</span> —{' '}
          <strong>{item.brigadeName}</strong> bumped a neighbor in{' '}
          <strong>{item.recipientCity}, {item.recipientState}</strong>
        </div>
        {item.blitzBumpCount > 0 && item.blitzId && (
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', marginTop: 4 }}>
            <span style={{ color: '#333333' }}>This is Bump #{item.blitzBumpCount} in </span>
            <Link href={`/blitz/${item.blitzId}`} style={{ color: '#1B7A3E', textDecoration: 'none', fontWeight: 700 }}>
              {item.blitzName}
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── DEDICATION ───────────────────────────────────────────────────────────────
  if (item.type === 'dedication') {
    const isMemory = item.attributionType === 121120001;
    const text = item.attributionText;
    const truncated = text.length > 300 && !expanded;
    const displayText = truncated ? text.slice(0, 300) + '...' : text;
    const [showPhotoOnly, setShowPhotoOnly] = useState(false);

    return (
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', marginBottom: 12 }}>
        {header}
        <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>

          {/* Toggle button — only when photo exists */}
          {item.attributionPhotoUrl && (
            <button
              onClick={() => setShowPhotoOnly(v => !v)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                background: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 20,
                padding: '4px 12px',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              {showPhotoOnly ? 'View Tribute' : 'View Photo'}
            </button>
          )}

          {showPhotoOnly ? (
            /* Photo only mode */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.attributionPhotoUrl}
              alt={item.attributionName}
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            /* Tribute mode — photo background with text overlay, or navy frame if no photo */
            <div style={{
              background: item.attributionPhotoUrl ? 'none' : '#1B2A4A',
              borderRadius: 6,
              borderTop: '3px solid #C5A028',
              borderBottom: '3px solid #C5A028',
              position: 'relative',
              overflow: 'hidden',
              minHeight: item.attributionPhotoUrl ? 280 : 'auto',
            }}>
              {/* Photo background */}
              {item.attributionPhotoUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.attributionPhotoUrl}
                    alt=""
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Dark overlay */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.62)' }} />
                </>
              )}

              {/* Text content */}
              <div style={{ position: 'relative', zIndex: 2, padding: '20px 24px' }}>
                <div style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.65rem',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: '#C5A028',
                  marginBottom: 8,
                }}>
                  {isMemory ? 'In Memory Of' : 'In Honor Of'}
                </div>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: 8,
                }}>
                  {item.attributionName}
                </div>
                <div style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 14,
                }}>
                  A flag flies in {item.recipientCity}, {STATE_NAMES[item.recipientState] ?? item.recipientState}.
                </div>
                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  &ldquo;{displayText}&rdquo;
                </p>
                {text.length > 300 && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C5A028',
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      padding: '8px 0 0',
                    }}
                  >
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── IN NOTE ─────────────────────────────────────────────────────────────────
  if (item.type === 'note_in') {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', marginBottom: 12 }}>
        {header}
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          fontStyle: 'italic',
          color: '#1B2A4A',
          lineHeight: 1.8,
          margin: '0 0 8px',
        }}>
          &ldquo;{item.noteIn}&rdquo;
        </p>
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028' }}>
          — {item.shareName ? (item.inFirstName || 'A Fellow Patriot') : 'A Fellow Patriot'}, in {item.recipientCity}, {STATE_NAMES[item.recipientState] ?? item.recipientState}
        </div>
      </div>
    );
  }

  // ── RN NOTE ─────────────────────────────────────────────────────────────────
  if (item.type === 'note_rn') {
    const rnName = item.rnDisplayName || item.rnFirstName || 'A Grateful Patriot';
    const rnAvatar = item.rnProfileImageUrl || getDefaultAvatar(item.rnNeighborId);
    const rnHeader = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rnAvatar} alt={rnName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #EEEEEE' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
            {rnName}
          </span>
          {item.rnIsVerified && <span style={{ color: '#C5A028', fontSize: '0.85rem', flexShrink: 0 }} title="Verified">✓</span>}
          {item.rnHandle && (
            <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
              @{item.rnHandle}
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA', flexShrink: 0, marginLeft: 'auto' }}>
          {item.relativeTime}
        </span>
      </div>
    );

    return (
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 20px', marginBottom: 12 }}>
        {rnHeader}
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          fontStyle: 'italic',
          color: '#1B2A4A',
          lineHeight: 1.8,
          margin: '0 0 8px',
        }}>
          &ldquo;{item.noteRn}&rdquo;
        </p>
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028' }}>
          — {item.rnFirstName || 'A Grateful Patriot'}, in {item.recipientCity}, {STATE_NAMES[item.recipientState] ?? item.recipientState}
        </div>
      </div>
    );
  }

  return null;
}
