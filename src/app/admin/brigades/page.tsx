import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import BrigadesClient from './BrigadesClient';

export interface AdminBrigade {
  brigadeId: string;
  name: string;
  brigadeType: number;
  brigadeTypeLabel: string;
  isVerified: boolean;
  isActive: boolean;
  memberCount: number;
  createdOn: string;
}

export default async function AdminBrigadesPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const brigadesRes = await dataverse.get<{ value: any[] }>(
      `bb_brigades?$select=bb_brigadeid,bb_name,bb_brigadetype,bb_isverified,statecode,createdon` +
      `&$orderby=createdon desc&$top=200`
    );

    const brigadeIds = (brigadesRes.value ?? []).map((b: any) => b.bb_brigadeid);

    // Get member counts
    let memberCounts: Record<string, number> = {};
    if (brigadeIds.length > 0) {
      const memberRes = await dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=(${brigadeIds.map((id: string) => `_bb_brigade_value eq '${id}'`).join(' or ')}) and statuscode eq 121120001` +
        `&$select=_bb_brigade_value`
      );
      memberCounts = (memberRes.value ?? []).reduce((acc: Record<string, number>, m: any) => {
        const id = m._bb_brigade_value;
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
    }

    const brigades: AdminBrigade[] = (brigadesRes.value ?? []).map((b: any) => ({
      brigadeId: b.bb_brigadeid,
      name: b.bb_name ?? '',
      brigadeType: b.bb_brigadetype ?? 0,
      brigadeTypeLabel: b['bb_brigadetype@OData.Community.Display.V1.FormattedValue'] ?? 'Other',
      isVerified: b.bb_isverified ?? false,
      isActive: b.statecode === 0,
      memberCount: memberCounts[b.bb_brigadeid] ?? 0,
      createdOn: b.createdon ?? '',
    }));

    return <BrigadesClient brigades={brigades} />;
  } catch (err) {
    console.error('Admin brigades fetch failed:', err);
    return <BrigadesClient brigades={[]} />;
  }
}
