import { dataverse } from '@/lib/dataverse';
import BlitzesClient from './BlitzesClient';

const BLITZ_STATUS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Upcoming', color: '#C5A028' },
  121120001: { label: 'Active', color: '#1B7A3E' },
  2: { label: 'Completed', color: '#1B2A4A' },
  121120002: { label: 'Cancelled', color: '#888888' },
};

export interface BlitzListItem {
  blitzId: string;
  blitzNumber: string;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  statusCode: number;
  statusLabel: string;
  statusColor: string;
  ownerName: string;
  brigadeCount: number;
}

export default async function BlitzesPage() {
  let blitzes: BlitzListItem[] = [];

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_blitzs?$filter=statecode eq 0 and statuscode ne 121120002` +
      `&$select=bb_blitzid,bb_blitznumber,bb_name,bb_description,bb_datestart,bb_dateend,statuscode,_bb_owner_value` +
      `&$orderby=statuscode asc,bb_dateend asc`
    );

    // Fetch owner names
    const ownerIds = [...new Set((res.value ?? []).map((b: any) => b._bb_owner_value).filter(Boolean))];
    let ownerMap: Record<string, string> = {};
    if (ownerIds.length > 0) {
      const ownersRes = await dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=${ownerIds.map(id => `bb_neighborid eq '${id}'`).join(' or ')}` +
        `&$select=bb_neighborid,bb_firstname,bb_lastname`
      );
      ownerMap = Object.fromEntries(
        (ownersRes.value ?? []).map((o: any) => [
          o.bb_neighborid,
          `${o.bb_firstname ?? ''} ${o.bb_lastname ?? ''}`.trim(),
        ])
      );
    }

    blitzes = (res.value ?? []).map((b: any) => {
      const statusInfo = BLITZ_STATUS_LABELS[b.statuscode] ?? { label: 'Unknown', color: '#888888' };
      return {
        blitzId: b.bb_blitzid,
        blitzNumber: b.bb_blitznumber,
        name: b.bb_name,
        description: b.bb_description ?? '',
        dateStart: b.bb_datestart ?? '',
        dateEnd: b.bb_dateend ?? '',
        statusCode: b.statuscode,
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color,
        ownerName: ownerMap[b._bb_owner_value] ?? 'A Patriot',
        brigadeCount: 0,
      };
    });
  } catch (err) {
    console.error('Blitzes fetch failed:', err);
  }

  return <BlitzesClient blitzes={blitzes} />;
}
