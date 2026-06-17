import { dataverse } from '@/lib/dataverse';

export interface SidebarNeighbor {
  neighborId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string;
  profileImageUrl: string;
  state: string;
}

export interface SidebarBrigade {
  brigadeId: string;
  name: string;
  brigadeType: number;
  profileImageUrl: string;
  isVerified: boolean;
  typeLabel: string;
}

export interface SidebarBlitz {
  blitzId: string;
  name: string;
  dateEnd: string;
  statusCode: number;
}

export interface SidebarData {
  neighbor: SidebarNeighbor;
  myBrigades: SidebarBrigade[];
  myBlitzes: SidebarBlitz[];
  suggestedBrigades: SidebarBrigade[];
  buddyIds: string[];
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

export async function getSidebarData(neighborId: string): Promise<SidebarData | null> {
  try {
    // Get neighbor
    const neighborRes = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_displayname,bb_handle,bb_profileimageurl,bb_state` +
      `&$top=1`
    );
    const n = neighborRes.value?.[0];
    if (!n) return null;

    const neighborId = n.bb_neighborid;

    const neighbor: SidebarNeighbor = {
      neighborId,
      firstName: n.bb_firstname ?? '',
      lastName: n.bb_lastname ?? '',
      displayName: n.bb_displayname ?? '',
      handle: n.bb_handle ?? '',
      profileImageUrl: n.bb_profileimageurl ?? '',
      state: n.bb_state ?? '',
    };

    // Fetch owned brigades + member brigades + blitzes in parallel
    const [ownedRes, memberRes, allBrigadesRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=_bb_owner_value eq '${neighborId}' and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_neighbor_value eq '${neighborId}' and statecode eq 0 and statuscode eq 121120001` +
        `&$select=bb_brigadeneighborid,_bb_brigade_value`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=statecode eq 0&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified&$orderby=bb_name asc&$top=20`
      ),
    ]);

    const ownedBrigades = (ownedRes.value ?? []).map((b: any) => ({
      brigadeId: b.bb_brigadeid,
      name: b.bb_name,
      brigadeType: b.bb_brigadetype,
      profileImageUrl: b.bb_profileimageurl ?? '',
      isVerified: b.bb_isverified ?? false,
      typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
    }));

    // Get member brigade details
    const memberBrigadeIds = (memberRes.value ?? []).map((bn: any) => bn._bb_brigade_value).filter(Boolean);
    let memberBrigades: SidebarBrigade[] = [];
    if (memberBrigadeIds.length > 0) {
      const memberDetailRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${memberBrigadeIds.map((id: string) => `bb_brigadeid eq '${id}'`).join(' or ')} and statecode eq 0` +
        `&$select=bb_brigadeid,bb_name,bb_brigadetype,bb_profileimageurl,bb_isverified`
      );
      memberBrigades = (memberDetailRes.value ?? []).map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        name: b.bb_name,
        brigadeType: b.bb_brigadetype,
        profileImageUrl: b.bb_profileimageurl ?? '',
        isVerified: b.bb_isverified ?? false,
        typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      }));
    }

    // Deduplicate
    const brigadeMap = new Map<string, SidebarBrigade>();
    [...ownedBrigades, ...memberBrigades].forEach(b => brigadeMap.set(b.brigadeId, b));
    const myBrigades = Array.from(brigadeMap.values());

    // Get my blitzes
    let myBlitzes: SidebarBlitz[] = [];
    if (myBrigades.length > 0) {
      const blitzBrigadeRes = await dataverse.get<{ value: any[] }>(
        `bb_blitzbrigades?$filter=${myBrigades.map(b => `_bb_brigade_value eq '${b.brigadeId}'`).join(' or ')} and statuscode eq 121120002 and statecode eq 0` +
        `&$select=_bb_blitz_value`
      );
      const blitzIds = [...new Set((blitzBrigadeRes.value ?? []).map((bb: any) => bb._bb_blitz_value).filter(Boolean))];
      if (blitzIds.length > 0) {
        const blitzRes = await dataverse.get<{ value: any[] }>(
          `bb_blitzs?$filter=${blitzIds.map(id => `bb_blitzid eq '${id}'`).join(' or ')} and statecode eq 0` +
          `&$select=bb_blitzid,bb_name,bb_dateend,statuscode`
        );
        myBlitzes = (blitzRes.value ?? []).map((bl: any) => ({
          blitzId: bl.bb_blitzid,
          name: bl.bb_name,
          dateEnd: bl.bb_dateend ?? '',
          statusCode: bl.statuscode,
        }));
      }
    }

    // Fetch buddy IDs (neighbors this user is following)
    const buddyRes = await dataverse.get<{ value: any[] }>(
      `bb_bannerbuddies?$filter=_bb_neighbor_value eq '${neighborId}' and statecode eq 0&$select=_bb_buddy_value&$top=200`
    );
    const buddyIds = (buddyRes.value ?? []).map((bb: any) => bb._bb_buddy_value).filter(Boolean);

    // Suggested brigades — ones user hasn't joined
    const myBrigadeIds = new Set(myBrigades.map(b => b.brigadeId));
    const suggestedBrigades = (allBrigadesRes.value ?? [])
      .filter((b: any) => !myBrigadeIds.has(b.bb_brigadeid))
      .slice(0, 5)
      .map((b: any) => ({
        brigadeId: b.bb_brigadeid,
        name: b.bb_name,
        brigadeType: b.bb_brigadetype,
        profileImageUrl: b.bb_profileimageurl ?? '',
        isVerified: b.bb_isverified ?? false,
        typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      }));

    return { neighbor, myBrigades, myBlitzes, suggestedBrigades, buddyIds };
  } catch (err) {
    console.error('getSidebarData failed:', err);
    return null;
  }
}
