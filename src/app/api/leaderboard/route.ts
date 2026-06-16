import type { NextRequest } from 'next/server';
import { dataverse } from '@/lib/dataverse';

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state') ?? '';
  const neighborId = req.nextUrl.searchParams.get('neighborId') ?? '';
  const myPoints = parseInt(req.nextUrl.searchParams.get('myPoints') ?? '0');

  if (!state) return Response.json({ error: 'Missing state' }, { status: 400 });

  try {
    const [top10Res, myRankRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=statecode eq 0 and bb_state eq '${state}' and bb_points gt 0` +
        `&$select=bb_neighborid,bb_displayname,bb_profileimageurl,bb_state,bb_points,bb_pointsalltime` +
        `&$orderby=bb_points desc&$top=10`
      ),
      neighborId && myPoints > 0
        ? dataverse.get<{ value: any[] }>(
            `bb_neighbors?$filter=statecode eq 0 and bb_state eq '${state}' and bb_points gt ${myPoints}&$select=bb_neighborid`
          )
        : Promise.resolve({ value: [] }),
    ]);

    const top10 = (top10Res.value ?? []).map((n: any, i: number) => ({
      neighborId: n.bb_neighborid,
      displayName: n.bb_displayname ?? 'Patriotic Neighbor',
      profileImageUrl: n.bb_profileimageurl ?? '',
      state: n.bb_state ?? '',
      points: n.bb_points ?? 0,
      pointsAllTime: n.bb_pointsalltime ?? 0,
      rank: i + 1,
    }));

    const myRank = neighborId && myPoints > 0
      ? (myRankRes.value?.length ?? 0) + 1
      : null;

    return Response.json({ top10, myRank });
  } catch (err) {
    console.error('State leaderboard API error:', err);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
