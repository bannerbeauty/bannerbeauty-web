import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import Link from 'next/link';
import BrigadeDetailClient from './BrigadeDetailClient';

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

const BRIGADE_SCOPE_LABELS: Record<number, string> = {
  121120000: 'Nationwide',
  121120001: 'Statewide',
  121120002: 'Countywide',
  121120003: 'Citywide',
  121120004: 'Neighborhood',
  121120005: 'Custom',
};

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

export interface BrigadeMember {
  brigadeneighborid: string;
  isAdmin: boolean;
  joinDate: string;
  neighborId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string;
  profileImageUrl: string;
}

export interface BrigadeBlitz {
  blitzId: string;
  blitzNumber: string;
  name: string;
  dateStart: string;
  dateEnd: string;
}

export interface BrigadeBump {
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  recipientCity: string;
  recipientState: string;
  createdOn: string;
}

export interface BrigadeDetail {
  brigadeId: string;
  brigadeNumber: string;
  name: string;
  brigadeType: number;
  brigadeScope: number;
  brigadeState: string;
  brigadeCity: string;
  brigadeScopeDescription: string;
  description: string;
  imageUrl: string;
  profileImageUrl: string;
  isVerified: boolean;
  ownerNeighborId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfileImageUrl: string;
  typeLabel: string;
  scopeLabel: string;
  countyNameFull: string;
}

export default async function BrigadeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  let neighborId: string | null = null;
  if (userEmail) {
    try {
      const res = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
        `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0&$select=bb_neighborid&$top=1`
      );
      neighborId = res.value?.[0]?.bb_neighborid ?? null;
    } catch {}
  }

  let brigade: BrigadeDetail | null = null;
  let members: BrigadeMember[] = [];
  let blitzes: BrigadeBlitz[] = [];
  let recentBumps: BrigadeBump[] = [];
  let membershipStatus: { brigadeneighborid: string; isAdmin: boolean; statuscode: number } | null = null;

  try {
    const [brigadeRes, membersRes, blitzesRes, bumpsRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=bb_brigadeid eq '${id}'` +
        `&$select=bb_brigadeid,bb_brigadenumber,bb_name,bb_brigadetype,bb_brigadescope,bb_brigadestate,bb_brigadecity,bb_brigadescopedescription,bb_description,bb_imageurl,bb_profileimageurl,bb_isverified,_bb_owner_value,_bb_brigadecounty_value` +
        `&$top=1`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_brigade_value eq '${id}' and statecode eq 0 and statuscode eq 121120001` +
        `&$select=bb_brigadeneighborid,bb_isadmin,bb_joindate` +
        `&$expand=bb_Neighbor($select=bb_neighborid,bb_firstname,bb_lastname,bb_profileimageurl,bb_displayname,bb_handle)`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_blitzs?$filter=_bb_owner_value eq '${id}' and statuscode eq 121120001` +
        `&$select=bb_blitzid,bb_blitznumber,bb_name,bb_datestart,bb_dateend`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_banners?$filter=_bb_brigade_value eq '${id}' and statuscode ne 121120002` +
        `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_recipientcity,bb_recipientstate,createdon` +
        `&$orderby=createdon desc&$top=10`
      ),
    ]);

    const b = brigadeRes.value?.[0];
    if (!b) notFound();

    const ownerRes = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${b._bb_owner_value}'&$select=bb_neighborid,bb_firstname,bb_lastname,bb_profileimageurl&$top=1`
    );
    const owner = ownerRes.value?.[0];

    let countyNameFull = '';
    if (b._bb_brigadecounty_value) {
      try {
        const countyRes = await dataverse.get<{ value: any[] }>(
          `bb_counties?$filter=bb_countyid eq '${b._bb_brigadecounty_value}'&$select=bb_countyname,bb_countynamefull&$top=1`
        );
        countyNameFull = countyRes.value?.[0]?.bb_countynamefull ?? '';
      } catch {}
    }

    brigade = {
      brigadeId: b.bb_brigadeid,
      brigadeNumber: b.bb_brigadenumber,
      name: b.bb_name,
      brigadeType: b.bb_brigadetype,
      brigadeScope: b.bb_brigadescope,
      brigadeState: b.bb_brigadestate ?? '',
      brigadeCity: b.bb_brigadecity ?? '',
      brigadeScopeDescription: b.bb_brigadescopedescription ?? '',
      description: b.bb_description ?? '',
      imageUrl: b.bb_imageurl ?? '',
      profileImageUrl: b.bb_profileimageurl ?? '',
      isVerified: b.bb_isverified ?? false,
      ownerNeighborId: owner?.bb_neighborid ?? '',
      ownerFirstName: owner?.bb_firstname ?? '',
      ownerLastName: owner?.bb_lastname ?? '',
      ownerProfileImageUrl: owner?.bb_profileimageurl ?? '',
      typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      scopeLabel: BRIGADE_SCOPE_LABELS[b.bb_brigadescope] ?? '',
      countyNameFull,
    };

    members = (membersRes.value ?? []).map((m: any) => ({
      brigadeneighborid: m.bb_brigadeneighborid,
      isAdmin: m.bb_isadmin ?? false,
      joinDate: m.bb_joindate ?? '',
      neighborId: m.bb_Neighbor?.bb_neighborid ?? '',
      firstName: m.bb_Neighbor?.bb_firstname ?? '',
      lastName: m.bb_Neighbor?.bb_lastname ?? '',
      displayName: m.bb_Neighbor?.bb_displayname ?? '',
      handle: m.bb_Neighbor?.bb_handle ?? '',
      profileImageUrl: m.bb_Neighbor?.bb_profileimageurl ?? '',
    }));

    blitzes = (blitzesRes.value ?? []).map((bl: any) => ({
      blitzId: bl.bb_blitzid,
      blitzNumber: bl.bb_blitznumber,
      name: bl.bb_name,
      dateStart: bl.bb_datestart ?? '',
      dateEnd: bl.bb_dateend ?? '',
    }));

    recentBumps = (bumpsRes.value ?? []).map((bump: any) => ({
      bannerId: bump.bb_bannerid,
      bannerNumber: bump.bb_bannernumber,
      bannerOption: bump.bb_banneroption,
      recipientCity: bump.bb_recipientcity ?? '',
      recipientState: bump.bb_recipientstate ?? '',
      createdOn: bump.createdon ?? '',
    }));

    if (neighborId) {
      const memberRes = await dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_brigade_value eq '${id}' and _bb_neighbor_value eq '${neighborId}'` +
        `&$select=bb_brigadeneighborid,bb_isadmin,statuscode&$top=1`
      );
      const m = memberRes.value?.[0];
      if (m) {
        membershipStatus = {
          brigadeneighborid: m.bb_brigadeneighborid,
          isAdmin: m.bb_isadmin ?? false,
          statuscode: m.statuscode,
        };
      }
    }
  } catch (err) {
    console.error('BrigadeDetail fetch failed:', err);
    notFound();
  }

  if (!brigade) notFound();

  return (
    <BrigadeDetailClient
      brigade={brigade}
      members={members}
      blitzes={blitzes}
      recentBumps={recentBumps}
      membershipStatus={membershipStatus}
      neighborId={neighborId}
      bannerOptionLabels={BANNER_OPTION_LABELS}
    />
  );
}
