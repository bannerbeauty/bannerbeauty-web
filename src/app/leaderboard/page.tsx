import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Patriot Leaderboard | Banner Beauty',
};

export interface LeaderboardNeighbor {
  neighborId: string;
  displayName: string;
  profileImageUrl: string;
  state: string;
  points: number;
  pointsAllTime: number;
  rank: number;
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export default async function LeaderboardPage() {
  const session = await getSession();
  const neighborId = session?.neighborId ?? null;

  let myNeighborId: string | null = null;
  let myPoints = 0;
  let myPointsAllTime = 0;
  let myState = '';
  let myDisplayName = '';
  let myProfileImageUrl = '';

  if (neighborId) {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
        `&$select=bb_neighborid,bb_displayname,bb_profileimageurl,bb_state,bb_points,bb_pointsalltime` +
        `&$top=1`
      );
      const n = res.value?.[0];
      if (n) {
        myNeighborId = n.bb_neighborid;
        myPoints = n.bb_points ?? 0;
        myPointsAllTime = n.bb_pointsalltime ?? 0;
        myState = n.bb_state ?? '';
        myDisplayName = n.bb_displayname ?? '';
        myProfileImageUrl = n.bb_profileimageurl ?? '';
      }
    } catch (err) {
      console.error('Leaderboard neighbor fetch failed:', err);
    }
  }

  // Fetch national top 10
  let nationalTop10: LeaderboardNeighbor[] = [];
  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=statecode eq 0 and bb_points gt 0` +
      `&$select=bb_neighborid,bb_displayname,bb_profileimageurl,bb_state,bb_points,bb_pointsalltime` +
      `&$orderby=bb_points desc&$top=10`
    );
    nationalTop10 = (res.value ?? []).map((n: any, i: number) => ({
      neighborId: n.bb_neighborid,
      displayName: n.bb_displayname ?? 'Patriotic Neighbor',
      profileImageUrl: n.bb_profileimageurl ?? '',
      state: n.bb_state ?? '',
      points: n.bb_points ?? 0,
      pointsAllTime: n.bb_pointsalltime ?? 0,
      rank: i + 1,
    }));
  } catch (err) {
    console.error('National leaderboard fetch failed:', err);
  }

  // Fetch my rank nationally
  let myNationalRank: number | null = null;
  if (myNeighborId && myPoints > 0) {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=statecode eq 0 and bb_points gt ${myPoints}&$select=bb_neighborid`
      );
      myNationalRank = (res.value?.length ?? 0) + 1;
    } catch {}
  }

  // Current points year
  const now = new Date();
  const pointsYear = (now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() >= 14))
    ? now.getFullYear()
    : now.getFullYear() - 1;

  return (
    <LeaderboardClient
      nationalTop10={nationalTop10}
      myNeighborId={myNeighborId}
      myPoints={myPoints}
      myPointsAllTime={myPointsAllTime}
      myState={myState}
      myDisplayName={myDisplayName}
      myProfileImageUrl={myProfileImageUrl}
      myNationalRank={myNationalRank}
      pointsYear={pointsYear}
      usStates={US_STATES}
    />
  );
}
