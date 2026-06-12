import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import BlitzDetailClient from './BlitzDetailClient';

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

const BLITZ_STATUS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Upcoming', color: '#C5A028' },
  121120001: { label: 'Active', color: '#1B7A3E' },
  2: { label: 'Completed', color: '#1B2A4A' },
  121120002: { label: 'Cancelled', color: '#888888' },
};

export interface BlitzBrigadeItem {
  blitzbrigadeid: string;
  brigadeId: string;
  brigadeName: string;
  brigadeProfileImageUrl: string;
  brigadeIsVerified: boolean;
  bumpCount: number;
}

export interface BlitzBump {
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  recipientCity: string;
  recipientState: string;
  createdOn: string;
  brigadeId: string;
}

export interface BlitzDetail {
  blitzId: string;
  blitzNumber: string;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  statusCode: number;
  statusLabel: string;
  statusColor: string;
  ownerNeighborId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerProfileImageUrl: string;
  imageUrl: string;
}

export interface UserBrigade {
  brigadeId: string;
  brigadeName: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export default async function BlitzDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  const sidebarData = userEmail ? await getSidebarData(userEmail) : null;

  let neighborId: string | null = null;
  if (userEmail) {
    try {
      const res = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
        `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0&$select=bb_neighborid&$top=1`
      );
      neighborId = res.value?.[0]?.bb_neighborid ?? null;
    } catch {}
  }

  let blitz: BlitzDetail | null = null;
  let participatingBrigades: BlitzBrigadeItem[] = [];
  let pendingBrigades: BlitzBrigadeItem[] = [];
  let recentBumps: BlitzBump[] = [];
  let userBrigades: UserBrigade[] = [];

  try {
    // Fetch blitz record
    const blitzRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzs?$filter=bb_blitzid eq '${id}'` +
      `&$select=bb_blitzid,bb_blitznumber,bb_name,bb_description,bb_datestart,bb_dateend,statuscode,_bb_owner_value,bb_imageurl` +
      `&$top=1`
    );

    const b = blitzRes.value?.[0];
    if (!b) notFound();

    // Fetch owner
    const ownerRes = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${b._bb_owner_value}'&$select=bb_neighborid,bb_firstname,bb_lastname,bb_profileimageurl&$top=1`
    );
    const owner = ownerRes.value?.[0];

    const statusInfo = BLITZ_STATUS_LABELS[b.statuscode] ?? { label: 'Unknown', color: '#888888' };

    blitz = {
      blitzId: b.bb_blitzid,
      blitzNumber: b.bb_blitznumber,
      name: b.bb_name,
      description: b.bb_description ?? '',
      dateStart: b.bb_datestart ?? '',
      dateEnd: b.bb_dateend ?? '',
      statusCode: b.statuscode,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color,
      ownerNeighborId: b._bb_owner_value ?? '',
      ownerFirstName: owner?.bb_firstname ?? '',
      ownerLastName: owner?.bb_lastname ?? '',
      ownerProfileImageUrl: owner?.bb_profileimageurl ?? '',
      imageUrl: b.bb_imageurl ?? '',
    };

    // Fetch participating brigades
    const participatingRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzbrigades?$filter=_bb_blitz_value eq '${id}' and statuscode eq 121120002` +
      `&$select=bb_blitzbrigadeid,_bb_brigade_value`
    );

    console.log('participatingRes raw:', JSON.stringify(participatingRes.value));
    const participatingBrigadeIds = (participatingRes.value ?? []).map((bb: any) => bb._bb_brigade_value).filter(Boolean);
    let participatingBrigadeDetails: any[] = [];
    if (participatingBrigadeIds.length > 0) {
      const brigadeRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${participatingBrigadeIds.map((bid: string) => `bb_brigadeid eq '${bid}'`).join(' or ')}&$select=bb_brigadeid,bb_name,bb_profileimageurl,bb_isverified`
      );
      participatingBrigadeDetails = brigadeRes.value ?? [];
    }

    participatingBrigades = (participatingRes.value ?? []).map((bb: any) => {
      const brigade = participatingBrigadeDetails.find((b: any) => b.bb_brigadeid === bb._bb_brigade_value);
      return {
        blitzbrigadeid: bb.bb_blitzbrigadeid,
        brigadeId: bb._bb_brigade_value ?? '',
        brigadeName: brigade?.bb_name ?? '',
        brigadeProfileImageUrl: brigade?.bb_profileimageurl ?? '',
        brigadeIsVerified: brigade?.bb_isverified ?? false,
        bumpCount: 0,
      };
    });

    // Fetch pending brigade requests
    const pendingRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzbrigades?$filter=_bb_blitz_value eq '${id}' and statuscode eq 1` +
      `&$select=bb_blitzbrigadeid,_bb_brigade_value`
    );

    const pendingBrigadeIds = (pendingRes.value ?? []).map((bb: any) => bb._bb_brigade_value).filter(Boolean);
    let pendingBrigadeDetails: any[] = [];
    if (pendingBrigadeIds.length > 0) {
      const pendingBrigadeRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${pendingBrigadeIds.map((bid: string) => `bb_brigadeid eq '${bid}'`).join(' or ')}&$select=bb_brigadeid,bb_name,bb_profileimageurl`
      );
      pendingBrigadeDetails = pendingBrigadeRes.value ?? [];
    }

    pendingBrigades = (pendingRes.value ?? []).map((bb: any) => {
      const brigade = pendingBrigadeDetails.find((b: any) => b.bb_brigadeid === bb._bb_brigade_value);
      return {
        blitzbrigadeid: bb.bb_blitzbrigadeid,
        brigadeId: bb._bb_brigade_value ?? '',
        brigadeName: brigade?.bb_name ?? '',
        brigadeProfileImageUrl: brigade?.bb_profileimageurl ?? '',
        brigadeIsVerified: false,
        bumpCount: 0,
      };
    });

    // Fetch recent bumps
    const bumpsRes = await dataverse.get<{ value: any[] }>(
      `bb_banners?$filter=_bb_blitz_value eq '${id}' and statuscode ne 121120002` +
      `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_recipientcity,bb_recipientstate,createdon,_bb_brigade_value` +
      `&$orderby=createdon desc&$top=20`
    );

    recentBumps = (bumpsRes.value ?? []).map((bump: any) => ({
      bannerId: bump.bb_bannerid,
      bannerNumber: bump.bb_bannernumber,
      bannerOption: bump.bb_banneroption,
      recipientCity: bump.bb_recipientcity ?? '',
      recipientState: bump.bb_recipientstate ?? '',
      createdOn: bump.createdon ?? '',
      brigadeId: bump._bb_brigade_value ?? '',
    }));

    // Calculate bump counts per brigade
    participatingBrigades = participatingBrigades.map(pb => ({
      ...pb,
      bumpCount: recentBumps.filter(bump => bump.brigadeId === pb.brigadeId).length,
    })).sort((a, b) => b.bumpCount - a.bumpCount);

    // Fetch user's brigades they own or admin
    if (neighborId) {
      const [ownedRes, adminRes] = await Promise.all([
        dataverse.get<{ value: any[] }>(
          `bb_brigades?$filter=_bb_owner_value eq '${neighborId}' and statecode eq 0` +
          `&$select=bb_brigadeid,bb_name`
        ),
        dataverse.get<{ value: any[] }>(
          `bb_brigadeneighbors?$filter=_bb_neighbor_value eq '${neighborId}' and bb_isadmin eq true and statecode eq 0 and statuscode eq 121120001` +
          `&$select=bb_brigadeneighborid` +
          `&$expand=bb_Brigade($select=bb_brigadeid,bb_name)`
        ),
      ]);

      const ownedBrigades = (ownedRes.value ?? []).map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        brigadeName: b.bb_name,
        isOwner: true,
        isAdmin: false,
      }));

      const adminBrigades = (adminRes.value ?? []).map((bn: any) => ({
        brigadeId: bn.bb_Brigade?.bb_brigadeid ?? '',
        brigadeName: bn.bb_Brigade?.bb_name ?? '',
        isOwner: false,
        isAdmin: true,
      }));

      // Combine and deduplicate
      const brigadeMap = new Map<string, UserBrigade>();
      [...ownedBrigades, ...adminBrigades].forEach(b => {
        if (b.brigadeId) brigadeMap.set(b.brigadeId, b);
      });
      userBrigades = Array.from(brigadeMap.values());
    }

  } catch (err) {
    console.error('BlitzDetail fetch failed:', err);
    // Only 404 if we have no blitz data at all
    if (!blitz) notFound();
  }

  if (!blitz) notFound();

  return (
    <BlitzDetailClient
      blitz={blitz}
      participatingBrigades={participatingBrigades}
      pendingBrigades={pendingBrigades}
      recentBumps={recentBumps}
      userBrigades={userBrigades}
      neighborId={neighborId}
      bannerOptionLabels={BANNER_OPTION_LABELS}
      sidebarData={sidebarData}
    />
  );
}
