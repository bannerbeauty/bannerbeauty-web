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
  bb_ispatriotsclub?: boolean;
}

export default async function CheckoutPage() {
  const session = await getSession();
  const neighborId = session?.neighborId ?? null;

  let dvNeighbor: DvNeighbor | null = null;
  let neighbor: NeighborData | null = null;

  if (neighborId) {
    try {
      const res = await dataverse.get<{ value: DvNeighbor[] }>(
        `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
        `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_addressline1,bb_addressline2,bb_city,bb_state,bb_zipcode,bb_ispatriotsclub` +
        `&$top=1`
      );
      dvNeighbor = res.value?.[0] ?? null;
    } catch {}

    if (dvNeighbor) {
      neighbor = {
        neighborId: dvNeighbor.bb_neighborid,
        firstName: dvNeighbor.bb_firstname ?? '',
        lastName: dvNeighbor.bb_lastname ?? '',
        phone: dvNeighbor.bb_phone ?? '',
        address1: dvNeighbor.bb_addressline1 ?? '',
        address2: dvNeighbor.bb_addressline2 ?? '',
        city: dvNeighbor.bb_city ?? '',
        state: dvNeighbor.bb_state ?? '',
        zipcode: dvNeighbor.bb_zipcode ?? '',
      };
    }
  }

  return (
    <CheckoutClient
      userEmail=""
      userFirstName={neighbor?.firstName ?? ''}
      userLastName={neighbor?.lastName ?? ''}
      neighbor={neighbor}
      isPatriotsClub={dvNeighbor?.bb_ispatriotsclub ?? false}
    />
  );
}
