import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
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

export interface CommunityBlitz {
  blitzId: string;
  name: string;
  dateEnd: string;
  statusCode: number;
  brigadeCount: number;
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

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/community');
  }

  const userEmail = session.user.email;

  // Get neighbor profile
  let neighbor: NeighborProfile | null = null;
  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_displayname,bb_handle,bb_profileimageurl,bb_state` +
      `&$top=1`
    );
    const n = res.value?.[0];
    if (n) {
      neighbor = {
        neighborId: n.bb_neighborid,
        firstName: n.bb_firstname ?? '',
        lastName: n.bb_lastname ?? '',
        displayName: n.bb_displayname ?? '',
        handle: n.bb_handle ?? '',
        profileImageUrl: n.bb_profileimageurl ?? '',
        brigadeCount: 0,
        state: n.bb_state ?? '',
      };
    }
  } catch (err) {
    console.error('Community neighbor fetch failed:', err);
  }

  if (!neighbor) redirect('/profile');

  const neighborId = neighbor.neighborId;

  let myBrigades: CommunityBrigade[] = [];
  let myBlitzes: CommunityBlitz[] = [];
  let recentBumps: CommunityBump[] = [];
  let suggestedBrigades: CommunityBrigade[] = [];
  let activeBlitzes: CommunityBlitz[] = [];

  try {
    const [
      ownedBrigadesRes,
      memberBrigadesRes,
      activeBlitzesRes,
      recentBumpsRes,
    ] = await Promise.all([
      // Brigades I own
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=_bb_owner_value eq '${neighborId}' and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified`
      ),
      // Brigades I'm a member of
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_neighbor_value eq '${neighborId}' and statecode eq 0 and statuscode eq 121120001` +
        `&$select=bb_brigadeneighborid,_bb_brigade_value`
      ),
      // Active blitzes
      dataverse.get<{ value: any[] }>(
        `bb_blitzs?$filter=statecode eq 0 and statuscode eq 121120001` +
        `&$select=bb_blitzid,bb_name,bb_dateend,statuscode` +
        `&$orderby=bb_dateend asc&$top=5`
      ),
      // Recent community bumps
      dataverse.get<{ value: any[] }>(
        `bb_banners?$filter=statuscode ne 121120002 and bb_isfeatureable eq true` +
        `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_recipientcity,bb_recipientstate,createdon,_bb_brigade_value` +
        `&$orderby=createdon desc&$top=20`
      ),
    ]);

    // Build my brigades list
    const ownedBrigades = (ownedBrigadesRes.value ?? []).map((b: any) => ({
      brigadeId: b.bb_brigadeid,
      name: b.bb_name,
      brigadeType: b.bb_brigadetype,
      profileImageUrl: b.bb_profileimageurl ?? '',
      isVerified: b.bb_isverified ?? false,
      memberCount: 0,
      typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
    }));

    // Get member brigade IDs
    const memberBrigadeIds = (memberBrigadesRes.value ?? [])
      .map((bn: any) => bn._bb_brigade_value)
      .filter(Boolean);

    // Fetch member brigade details
    let memberBrigadeDetails: CommunityBrigade[] = [];
    if (memberBrigadeIds.length > 0) {
      const memberBrigadesDetailRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${memberBrigadeIds.map((id: string) => `bb_brigadeid eq '${id}'`).join(' or ')} and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified`
      );
      memberBrigadeDetails = (memberBrigadesDetailRes.value ?? []).map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        name: b.bb_name,
        brigadeType: b.bb_brigadetype,
        profileImageUrl: b.bb_profileimageurl ?? '',
        isVerified: b.bb_isverified ?? false,
        memberCount: 0,
        typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      }));
    }

    // Combine and deduplicate
    const brigadeMap = new Map<string, CommunityBrigade>();
    [...ownedBrigades, ...memberBrigadeDetails].forEach(b => brigadeMap.set(b.brigadeId, b));
    myBrigades = Array.from(brigadeMap.values());
    neighbor.brigadeCount = myBrigades.length;

    // Active blitzes
    activeBlitzes = (activeBlitzesRes.value ?? []).map((bl: any) => ({
      blitzId: bl.bb_blitzid,
      name: bl.bb_name,
      dateEnd: bl.bb_dateend ?? '',
      statusCode: bl.statuscode,
      brigadeCount: 0,
    }));

    // My blitzes — blitzes where my brigades are participating
    if (myBrigades.length > 0) {
      const myBrigadeIds = myBrigades.map(b => b.brigadeId);
      const myBlitzesRes = await dataverse.get<{ value: any[] }>(
        `bb_blitzbrigades?$filter=${myBrigadeIds.map(id => `_bb_brigade_value eq '${id}'`).join(' or ')} and statuscode eq 121120002 and statecode eq 0` +
        `&$select=bb_blitzbrigadeid,_bb_blitz_value`
      );
      const myBlitzIds = [...new Set((myBlitzesRes.value ?? []).map((bb: any) => bb._bb_blitz_value).filter(Boolean))];
      if (myBlitzIds.length > 0) {
        const myBlitzDetailsRes = await dataverse.get<{ value: any[] }>(
          `bb_blitzs?$filter=${myBlitzIds.map(id => `bb_blitzid eq '${id}'`).join(' or ')} and statecode eq 0` +
          `&$select=bb_blitzid,bb_name,bb_dateend,statuscode`
        );
        myBlitzes = (myBlitzDetailsRes.value ?? []).map((bl: any) => ({
          blitzId: bl.bb_blitzid,
          name: bl.bb_name,
          dateEnd: bl.bb_dateend ?? '',
          statusCode: bl.statuscode,
          brigadeCount: 0,
        }));
      }
    }

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

    // Suggested brigades — brigades the user hasn't joined
    const myBrigadeIds = new Set(myBrigades.map(b => b.brigadeId));
    const allBrigadesRes = await dataverse.get<{ value: any[] }>(
      `bb_brigades?$filter=statecode eq 0` +
      `&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified` +
      `&$orderby=bb_name asc&$top=20`
    );
    suggestedBrigades = (allBrigadesRes.value ?? [])
      .filter((b: any) => !myBrigadeIds.has(b.bb_brigadeid))
      .slice(0, 5)
      .map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        name: b.bb_name,
        brigadeType: b.bb_brigadetype,
        profileImageUrl: b.bb_profileimageurl ?? '',
        isVerified: b.bb_isverified ?? false,
        memberCount: 0,
        typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      }));

  } catch (err) {
    console.error('Community data fetch failed:', err);
  }

  return (
    <CommunityClient
      neighbor={neighbor}
      myBrigades={myBrigades}
      myBlitzes={myBlitzes}
      recentBumps={recentBumps}
      suggestedBrigades={suggestedBrigades}
      activeBlitzes={activeBlitzes}
      bannerOptionLabels={BANNER_OPTION_LABELS}
    />
  );
}
