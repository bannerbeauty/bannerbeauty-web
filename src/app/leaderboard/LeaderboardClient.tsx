'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { LeaderboardNeighbor } from './page';

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

const MEDAL_COLORS = ['#C5A028', '#AAAAAA', '#B87333'];
const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

interface Props {
  nationalTop10: LeaderboardNeighbor[];
  myNeighborId: string | null;
  myPoints: number;
  myPointsAllTime: number;
  myState: string;
  myDisplayName: string;
  myProfileImageUrl: string;
  myNationalRank: number | null;
  pointsYear: number;
  usStates: string[];
}

export default function LeaderboardClient({
  nationalTop10,
  myNeighborId,
  myPoints,
  myPointsAllTime,
  myState,
  myDisplayName,
  myProfileImageUrl,
  myNationalRank,
  pointsYear,
  usStates,
}: Props) {
  const [scope, setScope] = useState<'national' | 'state'>('national');
  const [selectedState, setSelectedState] = useState(myState || 'CA');
  const [stateTop10, setStateTop10] = useState<LeaderboardNeighbor[]>([]);
  const [myStateRank, setMyStateRank] = useState<number | null>(null);
  const [stateLoading, setStateLoading] = useState(false);

  const loadStateLeaderboard = useCallback(async (state: string) => {
    setStateLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?state=${state}&neighborId=${myNeighborId ?? ''}&myPoints=${myPoints}`);
      const data = await res.json();
      setStateTop10(data.top10 ?? []);
      setMyStateRank(data.myRank ?? null);
    } catch {
      console.error('State leaderboard fetch failed');
    } finally {
      setStateLoading(false);
    }
  }, [myNeighborId, myPoints]);

  const handleScopeChange = (newScope: 'national' | 'state') => {
    setScope(newScope);
    if (newScope === 'state') loadStateLeaderboard(selectedState);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    loadStateLeaderboard(state);
  };

  const displayed = scope === 'national' ? nationalTop10 : stateTop10;
  const myRank = scope === 'national' ? myNationalRank : myStateRank;
  const isInTop10 = myNeighborId ? displayed.some(n => n.neighborId === myNeighborId) : false;

  const renderNeighborRow = (neighbor: LeaderboardNeighbor, showMedal = false) => (
    <Link key={neighbor.neighborId} href={`/neighbor/${neighbor.neighborId}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid #F5F5F5',
        background: neighbor.neighborId === myNeighborId ? 'rgba(197,160,40,0.05)' : '#FFFFFF',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: showMedal ? MEDAL_COLORS[neighbor.rank - 1] : '#EEEEEE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif', fontSize: showMedal ? '1rem' : '0.82rem',
          fontWeight: 700, color: showMedal ? '#FFFFFF' : '#888888',
        }}>
          {showMedal ? MEDAL_LABELS[neighbor.rank - 1] : neighbor.rank}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={neighbor.profileImageUrl || getDefaultAvatar(neighbor.neighborId)}
          alt={neighbor.displayName}
          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: neighbor.neighborId === myNeighborId ? '2px solid #C5A028' : 'none' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {neighbor.displayName}
            {neighbor.neighborId === myNeighborId && <span style={{ color: '#C5A028', marginLeft: 6, fontSize: '0.75rem' }}>★ You</span>}
          </div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888' }}>
            {neighbor.state} · {neighbor.pointsAllTime.toLocaleString()} pts all-time
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', fontSize: '1rem' }}>
            {neighbor.points.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.68rem', color: '#AAAAAA' }}>
            pts {pointsYear}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '32px 24px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 8 }}>
            {pointsYear} Season · Resets June 14, {pointsYear + 1}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
            ★ Patriot Leaderboard
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Every Banner Bump earns points. Top patriots win prizes on Flag Day {pointsYear + 1}.
          </p>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EEEEEE', padding: '12px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleScopeChange('national')}
            style={{
              padding: '8px 20px', borderRadius: 20,
              background: scope === 'national' ? '#1B2A4A' : 'transparent',
              color: scope === 'national' ? '#FFFFFF' : '#1B2A4A',
              border: '2px solid #1B2A4A',
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            🇺🇸 National
          </button>
          <button
            onClick={() => handleScopeChange('state')}
            style={{
              padding: '8px 20px', borderRadius: 20,
              background: scope === 'state' ? '#1B2A4A' : 'transparent',
              color: scope === 'state' ? '#FFFFFF' : '#1B2A4A',
              border: '2px solid #1B2A4A',
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            State
          </button>
          {scope === 'state' && (
            <select
              value={selectedState}
              onChange={e => handleStateChange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 20, border: '2px solid #1B2A4A', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', background: '#FFFFFF', cursor: 'pointer' }}
            >
              {usStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 100px' }}>

        {stateLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
            Loading...
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
            No patriots on the board yet. Be the first!
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>

            {/* Podium — Top 3 */}
            {displayed.length >= 3 && (
              <div style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)', padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16 }}>
                  {/* 2nd place */}
                  {displayed[1] && (
                    <Link href={`/neighbor/${displayed[1].neighborId}`} style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🥈</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayed[1].profileImageUrl || getDefaultAvatar(displayed[1].neighborId)} alt={displayed[1].displayName}
                        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #AAAAAA', margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayed[1].displayName}
                      </div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#AAAAAA' }}>
                        {displayed[1].points.toLocaleString()} pts
                      </div>
                      <div style={{ height: 48, background: 'rgba(170,170,170,0.3)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                    </Link>
                  )}
                  {/* 1st place */}
                  {displayed[0] && (
                    <Link href={`/neighbor/${displayed[0].neighborId}`} style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥇</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayed[0].profileImageUrl || getDefaultAvatar(displayed[0].neighborId)} alt={displayed[0].displayName}
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '4px solid #C5A028', margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayed[0].displayName}
                      </div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#C5A028' }}>
                        {displayed[0].points.toLocaleString()} pts
                      </div>
                      <div style={{ height: 64, background: 'rgba(197,160,40,0.3)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                    </Link>
                  )}
                  {/* 3rd place */}
                  {displayed[2] && (
                    <Link href={`/neighbor/${displayed[2].neighborId}`} style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🥉</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayed[2].profileImageUrl || getDefaultAvatar(displayed[2].neighborId)} alt={displayed[2].displayName}
                        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #B87333', margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayed[2].displayName}
                      </div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#B87333' }}>
                        {displayed[2].points.toLocaleString()} pts
                      </div>
                      <div style={{ height: 32, background: 'rgba(184,115,51,0.3)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Ranks 4-10 */}
            {displayed.slice(3).map(neighbor => renderNeighborRow(neighbor))}

          </div>
        )}

        {/* My Rank — sticky at bottom, only if logged in and not in top 10 */}
        {myNeighborId && myPoints > 0 && !isInTop10 && myRank && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#FFFFFF', borderTop: '2px solid #C5A028',
            padding: '12px 24px', zIndex: 50,
          }}>
            <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FAF7F2', border: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, color: '#888888', flexShrink: 0 }}>
                #{myRank}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={myProfileImageUrl || getDefaultAvatar(myNeighborId)} alt="You"
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A028', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A' }}>
                  {myDisplayName} <span style={{ color: '#C5A028' }}>★ You</span>
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888' }}>
                  {myPointsAllTime.toLocaleString()} pts all-time
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', fontSize: '1rem' }}>
                  {myPoints.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.68rem', color: '#AAAAAA' }}>
                  pts {pointsYear}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
