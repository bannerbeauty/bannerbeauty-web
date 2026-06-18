import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import NeighborsClient from './NeighborsClient';

export interface AdminNeighbor {
  neighborId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string;
  phone: string;
  state: string;
  isPatriotsClub: boolean;
  isAdmin: boolean;
  createdOn: string;
}

export default async function AdminNeighborsPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_displayname,bb_handle,bb_phone,bb_state,bb_ispatriotsclub,bb_isbannerbeautyadmin,createdon` +
      `&$orderby=createdon desc&$top=200`
    );

    const neighbors: AdminNeighbor[] = (res.value ?? []).map((n: any) => ({
      neighborId: n.bb_neighborid,
      firstName: n.bb_firstname ?? '',
      lastName: n.bb_lastname ?? '',
      displayName: n.bb_displayname ?? '',
      handle: n.bb_handle ?? '',
      phone: n.bb_phone ?? '',
      state: n.bb_state ?? '',
      isPatriotsClub: n.bb_ispatriotsclub ?? false,
      isAdmin: n.bb_isbannerbeautyadmin ?? false,
      createdOn: n.createdon ?? '',
    }));

    return <NeighborsClient neighbors={neighbors} />;
  } catch (err) {
    console.error('Admin neighbors fetch failed:', err);
    return <NeighborsClient neighbors={[]} />;
  }
}
