import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import BrigadeEditClient from './BrigadeEditClient';

export default async function BrigadeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  // Verify owner or admin
  let isEligible = false;
  let brigade = null;
  try {
    const [brigadeRes, adminRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=bb_brigadeid eq '${id}' and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_description,bb_brigadetype,bb_brigadescope,bb_brigadestate,bb_brigadecity,bb_brigadescopedescription,bb_profileimageurl,bb_imageurl,bb_isverified,_bb_owner_value,_bb_brigadecounty_value` +
        `&$top=1`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_brigade_value eq '${id}' and _bb_neighbor_value eq '${neighborId}' and bb_isadmin eq true and statecode eq 0&$select=bb_brigadeneighborid&$top=1`
      ),
    ]);

    const b = brigadeRes.value?.[0];
    if (!b) notFound();

    isEligible = b._bb_owner_value === neighborId || (adminRes.value?.length ?? 0) > 0;
    if (!isEligible) redirect(`/brigade/${id}`);

    // Get county name if exists
    let countyName = '';
    if (b._bb_brigadecounty_value) {
      const countyRes = await dataverse.get<{ value: any[] }>(
        `bb_counties?$filter=bb_countyid eq '${b._bb_brigadecounty_value}'&$select=bb_countyname&$top=1`
      );
      countyName = countyRes.value?.[0]?.bb_countyname ?? '';
    }

    brigade = {
      brigadeId: b.bb_brigadeid,
      name: b.bb_name ?? '',
      description: b.bb_description ?? '',
      brigadeType: b.bb_brigadetype ?? '',
      brigadeScope: b.bb_brigadescope ?? '',
      brigadeState: b.bb_brigadestate ?? '',
      brigadeCountyId: b._bb_brigadecounty_value ?? '',
      brigadeCountyName: countyName,
      brigadeCity: b.bb_brigadecity ?? '',
      brigadeScopeDescription: b.bb_brigadescopedescription ?? '',
      profileImageUrl: b.bb_profileimageurl ?? '',
      imageUrl: b.bb_imageurl ?? '',
    };
  } catch {
    notFound();
  }

  const sidebarData = await getSidebarData(neighborId);

  return (
    <BrigadeEditClient
      brigade={brigade!}
      sidebarData={sidebarData}
    />
  );
}
