import type { NextRequest } from 'next/server';
import { dataverse } from '@/lib/dataverse';

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state');
  if (!state) return Response.json({ counties: [] });

  try {
    const result = await dataverse.get<{ value: { bb_countyid: string; bb_countyname: string; bb_countynamefull: string }[] }>(
      `bb_counties?$filter=bb_stateabbreviation eq '${state}' and statecode eq 0&$select=bb_countyid,bb_countyname,bb_countynamefull&$orderby=bb_countyname asc`
    );
    return Response.json({ counties: result.value ?? [] });
  } catch (err) {
    console.error('County fetch error:', err);
    return Response.json({ counties: [] });
  }
}
