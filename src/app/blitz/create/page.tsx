import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import BlitzCreateClient from './BlitzCreateClient';

export const metadata = {
  title: 'Create a Banner Blitz | Banner Beauty',
};

export default async function BlitzCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ brigadeId?: string }>;
}) {
  const { brigadeId } = await searchParams;
  if (!brigadeId) redirect('/brigades');

  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect(`/signin`);
  }

  const neighborId = session.neighborId;

  // Verify the neighbor owns or admins this brigade
  let isEligible = false;
  let brigadeName = '';
  try {
    // Check if owner
    const ownerRes = await dataverse.get<{ value: any[] }>(
      `bb_brigades?$filter=bb_brigadeid eq '${brigadeId}' and _bb_owner_value eq '${neighborId}' and statecode eq 0&$select=bb_brigadeid,bb_name&$top=1`
    );
    if (ownerRes.value?.[0]) {
      isEligible = true;
      brigadeName = ownerRes.value[0].bb_name;
    }

    // Check if admin
    if (!isEligible) {
      const adminRes = await dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_brigade_value eq '${brigadeId}' and _bb_neighbor_value eq '${neighborId}' and bb_isadmin eq true and statecode eq 0&$select=bb_brigadeneighborid&$top=1`
      );
      if (adminRes.value?.[0]) {
        isEligible = true;
        const brigRes = await dataverse.get<{ value: any[] }>(
          `bb_brigades?$filter=bb_brigadeid eq '${brigadeId}'&$select=bb_name&$top=1`
        );
        brigadeName = brigRes.value?.[0]?.bb_name ?? '';
      }
    }
  } catch {}

  if (!isEligible) redirect(`/brigade/${brigadeId}`);

  return (
    <BlitzCreateClient
      brigadeId={brigadeId}
      brigadeName={brigadeName}
      neighborId={neighborId}
    />
  );
}
