import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import BannerBumpClient, {
  type NeighborData,
  type LetterTemplate,
  type FlagProduct,
  type GcProduct,
} from './BannerBumpClient';

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
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/submit-banner');
  }

  const userEmail = session.user.email;
  const userFirstName = session.user.name?.split(' ')[0] ?? '';
  const userLastName = session.user.name?.split(' ').slice(1).join(' ') ?? '';

  const [neighborRes, templatesRes, flagsRes, letterRes, gcProductsRes] = await Promise.allSettled([
    dataverse.get<{ value: DvNeighbor[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_addressline1,bb_addressline2,bb_city,bb_state,bb_zipcode&$top=1`
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

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', background: '#FAF7F2' }} />}>
      <BannerBumpClient
        userEmail={userEmail}
        userFirstName={userFirstName}
        userLastName={userLastName}
        neighbor={neighbor}
        letterTemplates={letterTemplates}
        flagProducts={flagProducts}
        gcProducts={gcProducts}
        letterPrice={letterPrice}
      />
    </Suspense>
  );
}
