import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import CheckoutClient, { type NeighborData } from './CheckoutClient';

interface DvNeighbor {
  bb_neighborid: string;
  bb_firstname?: string;
  bb_lastname?: string;
  bb_phone?: string;
  bb_addressline1?: string;
  bb_addressline2?: string;
  bb_city?: string;
  bb_state?: string;
  bb_zipcode?: string;
}

async function getNeighbor(neighborId: string): Promise<NeighborData | null> {
  try {
    const res = await dataverse.get<{ value: DvNeighbor[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_addressline1,bb_addressline2,bb_city,bb_state,bb_zipcode` +
      `&$top=1`
    );
    const n = res.value?.[0];
    if (!n) return null;
    return {
      neighborId: n.bb_neighborid,
      firstName: n.bb_firstname ?? '',
      lastName: n.bb_lastname ?? '',
      phone: n.bb_phone ?? '',
      address1: n.bb_addressline1 ?? '',
      address2: n.bb_addressline2 ?? '',
      city: n.bb_city ?? '',
      state: n.bb_state ?? '',
      zipcode: n.bb_zipcode ?? '',
    };
  } catch {
    return null;
  }
}

export default async function CheckoutPage() {
  const session = await getSession();
  let neighbor: NeighborData | null = null;

  const neighborId = session?.neighborId ?? null;

  if (neighborId) {
    neighbor = await getNeighbor(neighborId);
  }

  return (
    <CheckoutClient
      userEmail=""
      userFirstName={neighbor?.firstName ?? ''}
      userLastName={neighbor?.lastName ?? ''}
      neighbor={neighbor}
    />
  );
}
