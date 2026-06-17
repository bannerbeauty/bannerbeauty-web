import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import CommunityClient from './CommunityClient';

export const metadata = {
  title: 'Community | Banner Beauty',
};

export interface CommunityBrigade {
  brigadeId: string;
  name: string;
  brigadeType: number;
  profileImageUrl: string;
  isVerified: boolean;
  memberCount: number;
  typeLabel: string;
}

export interface CommunityBump {
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  recipientCity: string;
  recipientState: string;
  createdOn: string;
  brigadeName: string;
}

export interface NeighborProfile {
  neighborId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string;
  profileImageUrl: string;
  brigadeCount: number;
  state: string;
}

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

export default async function CommunityPage() {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  const sidebarData = await getSidebarData(neighborId);
  if (!sidebarData) redirect('/profile');

  const neighbor: NeighborProfile = {
    ...sidebarData.neighbor,
    brigadeCount: sidebarData.myBrigades.length,
  };

  let recentBumps: CommunityBump[] = [];

  try {
    const recentBumpsRes = await dataverse.get<{ value: any[] }>(
      `bb_banners?$filter=statuscode ne 121120002 and bb_isfeatureable eq true` +
      `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_recipientcity,bb_recipientstate,createdon,_bb_brigade_value` +
      `&$orderby=createdon desc&$top=20`
    );

    // Recent bumps with brigade names
    const bumpBrigadeIds = [...new Set((recentBumpsRes.value ?? []).map((b: any) => b._bb_brigade_value).filter(Boolean))];
    let bumpBrigadeMap: Record<string, string> = {};
    if (bumpBrigadeIds.length > 0) {
      const bumpBrigadesRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${bumpBrigadeIds.map(id => `bb_brigadeid eq '${id}'`).join(' or ')}&$select=bb_brigadeid,bb_name`
      );
      bumpBrigadeMap = Object.fromEntries(
        (bumpBrigadesRes.value ?? []).map((b: any) => [b.bb_brigadeid, b.bb_name])
      );
    }

    recentBumps = (recentBumpsRes.value ?? []).map((bump: any) => ({
      bannerId: bump.bb_bannerid,
      bannerNumber: bump.bb_bannernumber,
      bannerOption: bump.bb_banneroption,
      recipientCity: bump.bb_recipientcity ?? '',
      recipientState: bump.bb_recipientstate ?? '',
      createdOn: bump.createdon ?? '',
      brigadeName: bumpBrigadeMap[bump._bb_brigade_value] ?? '',
    }));

  } catch (err) {
    console.error('Community data fetch failed:', err);
  }

  return (
    <CommunityClient
      neighbor={neighbor}
      sidebarData={sidebarData}
      recentBumps={recentBumps}
      bannerOptionLabels={BANNER_OPTION_LABELS}
    />
  );
}
