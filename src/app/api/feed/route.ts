import type { NextRequest } from 'next/server';
import { dataverse } from '@/lib/dataverse';

export interface FeedItem {
  id: string;
  type: 'bump' | 'dedication' | 'note_in' | 'note_rn' | 'brigade_bump';
  createdOn: string;
  // Banner data
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  recipientCity: string;
  recipientState: string;
  // IN Neighbor
  neighborId: string;
  displayName: string;
  handle: string;
  profileImageUrl: string;
  isVerified: boolean;
  // RN data
  rnFirstName: string;
  // Dedication
  attributionType: number;
  attributionName: string;
  attributionText: string;
  // Notes
  noteIn: string;
  noteRn: string;
  shareName: boolean;
  inFirstName: string;
  // Brigade/Blitz
  brigadeId: string;
  brigadeName: string;
  blitzId: string;
  blitzName: string;
}

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

function relativeTime(iso: string): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const before = searchParams.get('before');
  const top = parseInt(searchParams.get('top') ?? '20');
  const neighborId = searchParams.get('neighborId') ?? '';
  const state = searchParams.get('state') ?? '';
  const brigadeIds = searchParams.get('brigadeIds')?.split(',').filter(Boolean) ?? [];
  const blitzIds = searchParams.get('blitzIds')?.split(',').filter(Boolean) ?? [];

  try {
    // Build filter
    let filter = 'statecode eq 0 and statuscode ne 121120002';
    if (before) filter += ` and createdon lt ${before}`;

    // Fetch banners — get enough to expand into multiple feed items
    const bannersRes = await dataverse.get<{ value: any[] }>(
      `bb_banners?$filter=${filter}` +
      `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_recipientcity,bb_recipientstate,` +
      `bb_isfeatureable,bb_ispublicattribution,bb_ispublicnotein,bb_ispublicnotern,` +
      `bb_attributiontype,bb_attributionname,bb_attributiontext,` +
      `bb_notein,bb_notern,bb_sharename,bb_infirstname,bb_rnfirstname,` +
      `_bb_initiatingneighbor_value,_bb_brigade_value,_bb_blitz_value,createdon` +
      `&$orderby=createdon desc&$top=50`
    );

    const banners = bannersRes.value ?? [];

    // Collect unique IDs for batch fetching
    const neighborIds = [...new Set(banners.map((b: any) => b._bb_initiatingneighbor_value).filter(Boolean))];
    const allBrigadeIds = [...new Set(banners.map((b: any) => b._bb_brigade_value).filter(Boolean))];
    const allBlitzIds = [...new Set(banners.map((b: any) => b._bb_blitz_value).filter(Boolean))];

    // Batch fetch neighbors, brigades, blitzes
    const [neighborsRes, brigadesRes, blitzesRes] = await Promise.all([
      neighborIds.length > 0
        ? dataverse.get<{ value: any[] }>(
            `bb_neighbors?$filter=${neighborIds.map(id => `bb_neighborid eq '${id}'`).join(' or ')}` +
            `&$select=bb_neighborid,bb_displayname,bb_handle,bb_profileimageurl,bb_isprofileimageapproved`
          )
        : Promise.resolve({ value: [] }),
      allBrigadeIds.length > 0
        ? dataverse.get<{ value: any[] }>(
            `bb_brigades?$filter=${allBrigadeIds.map(id => `bb_brigadeid eq '${id}'`).join(' or ')}` +
            `&$select=bb_brigadeid,bb_name,bb_isverified`
          )
        : Promise.resolve({ value: [] }),
      allBlitzIds.length > 0
        ? dataverse.get<{ value: any[] }>(
            `bb_blitzs?$filter=${allBlitzIds.map(id => `bb_blitzid eq '${id}'`).join(' or ')}` +
            `&$select=bb_blitzid,bb_name`
          )
        : Promise.resolve({ value: [] }),
    ]);

    // Build lookup maps
    const neighborMap = Object.fromEntries(
      (neighborsRes.value ?? []).map((n: any) => [n.bb_neighborid, n])
    );
    const brigadeMap = Object.fromEntries(
      (brigadesRes.value ?? []).map((b: any) => [b.bb_brigadeid, b])
    );
    const blitzMap = Object.fromEntries(
      (blitzesRes.value ?? []).map((bl: any) => [bl.bb_blitzid, bl])
    );

    // Expand each banner into feed items
    const feedItems: FeedItem[] = [];

    for (const b of banners) {
      const neighbor = neighborMap[b._bb_initiatingneighbor_value] ?? {};
      const brigade = brigadeMap[b._bb_brigade_value] ?? {};
      const blitz = blitzMap[b._bb_blitz_value] ?? {};

      const base = {
        bannerId: b.bb_bannerid,
        bannerNumber: b.bb_bannernumber,
        bannerOption: b.bb_banneroption,
        recipientCity: b.bb_recipientcity ?? '',
        recipientState: b.bb_recipientstate ?? '',
        neighborId: b._bb_initiatingneighbor_value ?? '',
        displayName: neighbor.bb_displayname ?? '',
        handle: neighbor.bb_handle ?? '',
        profileImageUrl: neighbor.bb_profileimageurl ?? '',
        isVerified: neighbor.bb_isverified ?? false,
        rnFirstName: b.bb_rnfirstname ?? '',
        attributionType: b.bb_attributiontype ?? 0,
        attributionName: b.bb_attributionname ?? '',
        attributionText: b.bb_attributiontext ?? '',
        noteIn: b.bb_notein ?? '',
        noteRn: b.bb_notern ?? '',
        shareName: b.bb_sharename ?? false,
        inFirstName: b.bb_infirstname ?? '',
        brigadeId: b._bb_brigade_value ?? '',
        brigadeName: brigade.bb_name ?? '',
        blitzId: b._bb_blitz_value ?? '',
        blitzName: blitz.bb_name ?? '',
        createdOn: b.createdon ?? '',
      };

      // Tier 1 — My Brigades/Blitzes items first
      const isMyBrigade = brigadeIds.includes(base.brigadeId);
      const isMyBlitz = blitzIds.includes(base.blitzId);
      const isMyState = state && b.bb_recipientstate === state;

      // 1. Banner Bump post (always)
      feedItems.push({
        ...base,
        id: `bump-${b.bb_bannerid}`,
        type: 'bump',
        _tier: isMyBrigade || isMyBlitz ? 1 : isMyState ? 2 : 3,
      } as any);

      // 2. Dedication post
      if (b.bb_isfeatureable && b.bb_ispublicattribution && b.bb_attributionname && b.bb_attributiontext) {
        feedItems.push({
          ...base,
          id: `dedication-${b.bb_bannerid}`,
          type: 'dedication',
          _tier: isMyBrigade || isMyBlitz ? 1 : isMyState ? 2 : 3,
        } as any);
      }

      // 3. IN Note post
      if (b.bb_ispublicnotein && b.bb_notein) {
        feedItems.push({
          ...base,
          id: `note_in-${b.bb_bannerid}`,
          type: 'note_in',
          _tier: isMyBrigade || isMyBlitz ? 1 : isMyState ? 2 : 3,
        } as any);
      }

      // 4. RN Note post
      if (b.bb_ispublicnotern && b.bb_notern) {
        feedItems.push({
          ...base,
          id: `note_rn-${b.bb_bannerid}`,
          type: 'note_rn',
          _tier: isMyBrigade || isMyBlitz ? 1 : isMyState ? 2 : 3,
        } as any);
      }

      // 5. Brigade Bump post (if part of a blitz)
      if (base.brigadeId && base.blitzId) {
        feedItems.push({
          ...base,
          id: `brigade_bump-${b.bb_bannerid}`,
          type: 'brigade_bump',
          _tier: isMyBrigade || isMyBlitz ? 1 : isMyState ? 2 : 3,
        } as any);
      }
    }

    // Sort by tier then by date
    feedItems.sort((a: any, b: any) => {
      if (a._tier !== b._tier) return a._tier - b._tier;
      return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
    });

    // Return top N items
    const result = feedItems.slice(0, top).map(item => ({
      ...item,
      relativeTime: relativeTime(item.createdOn),
      bannerOptionLabel: BANNER_OPTION_LABELS[item.bannerOption] ?? 'Letter',
    }));

    return Response.json({ items: result, hasMore: feedItems.length > top });

  } catch (err) {
    console.error('Feed API error:', err);
    return Response.json({ items: [], hasMore: false }, { status: 500 });
  }
}
