import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import BlitzesAdminClient from './BlitzesAdminClient';

export interface AdminBlitz {
  blitzId: string;
  blitzNumber: string;
  name: string;
  statusCode: number;
  statusLabel: string;
  dateStart: string;
  dateEnd: string;
  brigadeCount: number;
  bumpCount: number;
}

export default async function AdminBlitzesPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const blitzesRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzs?$select=bb_blitzid,bb_blitznumber,bb_name,statuscode,bb_datestart,bb_dateend&$orderby=createdon desc&$top=200`
    );

    const blitzIds = (blitzesRes.value ?? []).map((b: any) => b.bb_blitzid);

    let brigadeCounts: Record<string, number> = {};
    let bumpCounts: Record<string, number> = {};

    if (blitzIds.length > 0) {
      const [brigadeRes, bumpRes] = await Promise.all([
        dataverse.get<{ value: any[] }>(
          `bb_blitzbrigades?$filter=(${blitzIds.map((id: string) => `_bb_blitz_value eq '${id}'`).join(' or ')}) and statuscode eq 121120002` +
          `&$select=_bb_blitz_value`
        ),
        dataverse.get<{ value: any[] }>(
          `bb_banners?$filter=(${blitzIds.map((id: string) => `_bb_blitz_value eq '${id}'`).join(' or ')}) and statecode eq 0` +
          `&$select=_bb_blitz_value`
        ),
      ]);

      brigadeCounts = (brigadeRes.value ?? []).reduce((acc: Record<string, number>, bb: any) => {
        const id = bb._bb_blitz_value;
        if (id) acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});

      bumpCounts = (bumpRes.value ?? []).reduce((acc: Record<string, number>, bn: any) => {
        const id = bn._bb_blitz_value;
        if (id) acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
    }

    const blitzes: AdminBlitz[] = (blitzesRes.value ?? []).map((b: any) => ({
      blitzId: b.bb_blitzid,
      blitzNumber: b.bb_blitznumber ?? '',
      name: b.bb_name ?? '',
      statusCode: b.statuscode ?? 0,
      statusLabel: b['statuscode@OData.Community.Display.V1.FormattedValue'] ?? '',
      dateStart: b.bb_datestart ?? '',
      dateEnd: b.bb_dateend ?? '',
      brigadeCount: brigadeCounts[b.bb_blitzid] ?? 0,
      bumpCount: bumpCounts[b.bb_blitzid] ?? 0,
    }));

    return <BlitzesAdminClient blitzes={blitzes} />;
  } catch (err) {
    console.error('Admin blitzes fetch failed:', err);
    return <BlitzesAdminClient blitzes={[]} />;
  }
}
