import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import BannerBumpClient, {
  type NeighborData,
  type LetterTemplate,
  type FlagProduct,
  type GcProduct,
} from './BannerBumpClient';

export interface ActiveBlitz {
  blitzId: string;
  blitzName: string;
  brigades: { brigadeId: string; brigadeName: string }[];
}

async function getNeighborActiveBlitzes(neighborId: string): Promise<ActiveBlitz[]> {
  try {
    const [ownedRes, adminRes] = await Promise.all([
      dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=_bb_owner_value eq '${neighborId}' and statecode eq 0&$select=bb_brigadeid,bb_name`
      ),
      dataverse.get<{ value: any[] }>(
        `bb_brigadeneighbors?$filter=_bb_neighbor_value eq '${neighborId}' and bb_isadmin eq true and statecode eq 0 and statuscode eq 121120001&$select=_bb_brigade_value`
      ),
    ]);

    const brigadeIds = [
      ...(ownedRes.value ?? []).map((b: any) => ({ id: b.bb_brigadeid, name: b.bb_name })),
    ];

    const adminBrigadeIds = (adminRes.value ?? []).map((bn: any) => bn._bb_brigade_value).filter(Boolean);
    if (adminBrigadeIds.length > 0) {
      const adminBrigadesRes = await dataverse.get<{ value: any[] }>(
        `bb_brigades?$filter=${adminBrigadeIds.map((id: string) => `bb_brigadeid eq '${id}'`).join(' or ')}&$select=bb_brigadeid,bb_name`
      );
      brigadeIds.push(...(adminBrigadesRes.value ?? []).map((b: any) => ({ id: b.bb_brigadeid, name: b.bb_name })));
    }

    if (brigadeIds.length === 0) return [];

    const blitzBrigadeRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzbrigades?$filter=${brigadeIds.map(b => `_bb_brigade_value eq '${b.id}'`).join(' or ')} and statuscode eq 121120002 and statecode eq 0&$select=_bb_blitz_value,_bb_brigade_value`
    );

    const blitzIds = [...new Set((blitzBrigadeRes.value ?? []).map((bb: any) => bb._bb_blitz_value).filter(Boolean))];
    if (blitzIds.length === 0) return [];

    const blitzRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzs?$filter=${blitzIds.map(id => `bb_blitzid eq '${id}'`).join(' or ')} and statuscode eq 121120001 and statecode eq 0&$select=bb_blitzid,bb_name`
    );

    const blitzMap = new Map<string, ActiveBlitz>();
    for (const bl of blitzRes.value ?? []) {
      const matchingBBs = blitzBrigadeRes.value?.filter((bb: any) => bb._bb_blitz_value === bl.bb_blitzid) ?? [];
      for (const bb of matchingBBs) {
        const brigade = brigadeIds.find(b => b.id === bb._bb_brigade_value);
        if (!brigade) continue;
        if (blitzMap.has(bl.bb_blitzid)) {
          blitzMap.get(bl.bb_blitzid)!.brigades.push({ brigadeId: brigade.id, brigadeName: brigade.name });
        } else {
          blitzMap.set(bl.bb_blitzid, {
            blitzId: bl.bb_blitzid,
            blitzName: bl.bb_name,
            brigades: [{ brigadeId: brigade.id, brigadeName: brigade.name }],
          });
        }
      }
    }
    return Array.from(blitzMap.values());
  } catch (err) {
    console.error('getNeighborActiveBlitzes failed:', err);
    return [];
  }
}

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
  bb_bumpbalance?: number;
  bb_ispatriotsclub?: boolean;
}

interface DvTemplate {
  bb_lettertemplateid: string;
  bb_templatename?: string;
  bb_previewtext?: string;
  bb_bodyhtml?: string;
}

interface DvFlagProduct {
  bb_productid: string;
  bb_productname: string;
  bb_price: number;
  bb_productnumber: string;
}

interface DvLetterProduct {
  bb_price: number;
}

interface DvGcProduct {
  bb_productid: string;
  bb_productname: string;
  bb_price: number;
  bb_productnumber: string;
}

export default async function SubmitBannerPage() {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  const [neighborRes, templatesRes, flagsRes, letterRes, gcProductsRes] = await Promise.allSettled([
    dataverse.get<{ value: DvNeighbor[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_addressline1,bb_addressline2,bb_city,bb_state,bb_zipcode,bb_bumpbalance,bb_ispatriotsclub&$top=1`
    ),
    dataverse.get<{ value: DvTemplate[] }>(
      `bb_lettertemplates?$filter=statecode eq 0` +
      `&$select=bb_lettertemplateid,bb_templatename,bb_previewtext,bb_bodyhtml&$orderby=bb_sortorder asc`
    ),
    dataverse.get<{ value: DvFlagProduct[] }>(
      `bb_products?$filter=statecode eq 0 and bb_producttype eq 121120000` +
      `&$select=bb_productid,bb_productname,bb_price,bb_productnumber&$orderby=bb_productnumber asc`
    ),
    dataverse.get<{ value: DvLetterProduct[] }>(
      `bb_products?$filter=bb_productnumber eq 'PN-LTR-STD'&$select=bb_price&$top=1`
    ),
    dataverse.get<{ value: DvGcProduct[] }>(
      `bb_products?$filter=statecode eq 0 and bb_producttype eq 121120004` +
      `&$select=bb_productid,bb_productname,bb_price,bb_productnumber&$orderby=bb_price asc`
    ),
  ]);

  [neighborRes, templatesRes, flagsRes, letterRes, gcProductsRes].forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Fetch ${index} failed:`, result.reason);
    }
  });

  const dvNeighbor = neighborRes.status === 'fulfilled' ? neighborRes.value.value?.[0] : null;
  const neighbor: NeighborData | null = dvNeighbor
    ? {
        neighborId: dvNeighbor.bb_neighborid,
        firstName: dvNeighbor.bb_firstname ?? '',
        lastName: dvNeighbor.bb_lastname ?? '',
        phone: dvNeighbor.bb_phone ?? '',
        address1: dvNeighbor.bb_addressline1 ?? '',
        address2: dvNeighbor.bb_addressline2 ?? '',
        city: dvNeighbor.bb_city ?? '',
        state: dvNeighbor.bb_state ?? '',
        zipcode: dvNeighbor.bb_zipcode ?? '',
        bumpBalance: dvNeighbor.bb_bumpbalance ?? 0,
      }
    : null;

  const letterTemplates: LetterTemplate[] =
    templatesRes.status === 'fulfilled'
      ? (templatesRes.value.value ?? []).map((t) => ({
          id: t.bb_lettertemplateid,
          name: t.bb_templatename ?? '',
          previewText: t.bb_previewtext ?? '',
          bodyHtml: t.bb_bodyhtml ?? '',
        }))
      : [];

  const flagProducts: FlagProduct[] =
    flagsRes.status === 'fulfilled'
      ? (flagsRes.value.value ?? []).map((p) => ({
          productid: p.bb_productid,
          name: p.bb_productname,
          price: p.bb_price,
          productnumber: p.bb_productnumber,
        }))
      : [];

  const letterPrice =
    letterRes.status === 'fulfilled'
      ? (letterRes.value.value?.[0]?.bb_price ?? 0)
      : 0;

  const gcProducts: GcProduct[] =
    gcProductsRes.status === 'fulfilled'
      ? (gcProductsRes.value.value ?? []).map((p) => ({
          productid: p.bb_productid,
          name: p.bb_productname,
          price: p.bb_price,
          productnumber: p.bb_productnumber,
        }))
      : [];

  const patriotsClubBalance = neighbor?.bumpBalance ?? 0;
  const activeBlitzes = neighbor?.neighborId ? await getNeighborActiveBlitzes(neighbor.neighborId) : [];

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', background: '#FAF7F2' }} />}>
      <BannerBumpClient
        userEmail=""
        userFirstName={neighbor?.firstName ?? ''}
        userLastName={neighbor?.lastName ?? ''}
        neighbor={neighbor}
        letterTemplates={letterTemplates}
        flagProducts={flagProducts}
        gcProducts={gcProducts}
        letterPrice={letterPrice}
        activeBlitzes={activeBlitzes}
        patriotsClubBalance={patriotsClubBalance}
      />
    </Suspense>
  );
}
