import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import NeighborProfileClient from './NeighborProfileClient';

export interface NeighborProfile {
  neighborId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string;
  profileImageUrl: string;
  imageUrl: string;
  description: string;
  isVerified: boolean;
  city: string;
  state: string;
  createdOn: string;
}

export interface NeighborBrigade {
  brigadeId: string;
  name: string;
  profileImageUrl: string;
  isVerified: boolean;
  typeLabel: string;
}

const BRIGADE_TYPE_LABELS: Record<number, string> = {
  121120000: 'Law Enforcement',
  121120001: 'Fire & Rescue',
  121120002: 'Medical',
  121120003: 'Military Unit',
  121120004: 'Veteran Organization',
  121120005: 'Civic Organization',
  121120006: 'School or University',
  121120007: 'Club or Association',
  121120008: 'Other',
};

export default async function NeighborProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=/neighbor/${id}`);
  }

  const userEmail = session.user.email;

  // Get logged-in neighbor ID
  let loggedInNeighborId: string | null = null;
  try {
    const res = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0&$select=bb_neighborid&$top=1`
    );
    loggedInNeighborId = res.value?.[0]?.bb_neighborid ?? null;
  } catch {}

  const sidebarData = await getSidebarData(userEmail);

  let profile: NeighborProfile | null = null;
  let brigades: NeighborBrigade[] = [];

  try {
    const [profileRes, brigadeMemberRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=bb_neighborid eq '${id}' and statecode eq 0` +
        `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_displayname,bb_handle,bb_profileimageurl,bb_imageurl,bb_description,bb_isverified,bb_city,bb_state,createdon` +
        `&$top=1`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_neighbor_value eq '${id}' and statecode eq 0 and statuscode eq 121120001` +
        `&$select=bb_brigadeneighborid,_bb_brigade_value`
      ),
    ]);

    const n = profileRes.value?.[0];
    if (!n) notFound();

    profile = {
      neighborId: n.bb_neighborid,
      firstName: n.bb_firstname ?? '',
      lastName: n.bb_lastname ?? '',
      displayName: n.bb_displayname ?? '',
      handle: n.bb_handle ?? '',
      profileImageUrl: n.bb_profileimageurl ?? '',
      imageUrl: n.bb_imageurl ?? '',
      description: n.bb_description ?? '',
      isVerified: n.bb_isverified ?? false,
      city: n.bb_city ?? '',
      state: n.bb_state ?? '',
      createdOn: n.createdon ?? '',
    };

    // Get brigade details
    const brigadeIds = (brigadeMemberRes.value ?? []).map((bn: any) => bn._bb_brigade_value).filter(Boolean);
    if (brigadeIds.length > 0) {
      const brigadeRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${brigadeIds.map((bid: string) => `bb_brigadeid eq '${bid}'`).join(' or ')} and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_profileimageurl,bb_isverified,bb_brigadetype`
      );
      brigades = (brigadeRes.value ?? []).map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        name: b.bb_name,
        profileImageUrl: b.bb_profileimageurl ?? '',
        isVerified: b.bb_isverified ?? false,
        typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      }));
    }
  } catch (err) {
    console.error('NeighborProfile fetch failed:', err);
    notFound();
  }

  if (!profile) notFound();

  const isOwnProfile = loggedInNeighborId === id;

  return (
    <NeighborProfileClient
      profile={profile}
      brigades={brigades}
      sidebarData={sidebarData}
      neighborId={loggedInNeighborId}
      isOwnProfile={isOwnProfile}
    />
  );
}
