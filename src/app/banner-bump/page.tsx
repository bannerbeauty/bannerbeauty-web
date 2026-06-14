import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import TransactionClient from './TransactionClient';

interface DvBanner {
  bb_bannerid: string;
  bb_bannernumber?: string;
  bb_banneroption?: number;
  bb_attributiontype?: string;
  bb_attributionname?: string;
  bb_attributiontext?: string;
  bb_notein?: string;
  bb_notern?: string;
  bb_ispublicnotern?: boolean;
  bb_sharename?: boolean;
  bb_sharephone?: boolean;
  bb_shareemail?: boolean;
  bb_shareaddress?: boolean;
  bb_beforephotourl?: string;
  bb_afterphotourl?: string;
  bb_attributionphoto?: string;
  bb_ispublicattribution?: boolean;
  bb_letterpdfurl?: string;
  bb_qrtokenuseddatetime?: string;
  _bb_order_value?: string;
  _bb_lettertemplate_value?: string;
  _bb_initiatingneighbor_value?: string;
  _bb_recipientneighbor_value?: string;
}

interface DvLetterTemplate {
  bb_templatename?: string;
  bb_bodyhtml?: string;
}

interface DvNeighborFull {
  bb_firstname?: string;
  bb_lastname?: string;
  bb_phone?: string;
  bb_email?: string;
  bb_addressline1?: string;
  bb_city?: string;
  bb_state?: string;
}

interface DvNeighborBasic {
  bb_firstname?: string;
  bb_lastname?: string;
}

interface DvOrderItem {
  bb_giftcertcode?: string;
  bb_unitprice?: number;
}

export default async function BannerBumpPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect('/');

  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  // Step 1: Fetch banner (no $expand)
  let banner: DvBanner | null = null;
  try {
    const res = await dataverse.get<{ value: DvBanner[] }>(
      `bb_banners?$filter=bb_qrtoken eq '${token}' and statecode eq 0` +
      `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,bb_attributiontype,bb_attributionname,bb_attributiontext,bb_notein,bb_notern,bb_ispublicnotern,bb_ispublicattribution,bb_sharename,bb_sharephone,bb_shareemail,bb_shareaddress,bb_beforephotourl,bb_afterphotourl,bb_attributionphoto,bb_letterpdfurl,bb_qrtokenuseddatetime,_bb_order_value,_bb_lettertemplate_value,_bb_initiatingneighbor_value,_bb_recipientneighbor_value` +
      `&$top=1`
    );
    banner = res.value?.[0] ?? null;
  } catch (err) {
    console.error('Banner fetch failed:', err);
  }

  if (!banner) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9F6F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#1A1A2E', marginBottom: 12 }}>
            Link Not Found
          </h1>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
            This Banner Bump link is not valid or has already expired. Check that you scanned the correct QR code.
          </p>
          <a href="/" style={{
            display: 'inline-block', padding: '12px 28px', background: '#C5A028',
            color: '#FFFFFF', borderRadius: 4, textDecoration: 'none',
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Step 2: Parallel fetches for related records + GC
  const letterTemplateId = banner._bb_lettertemplate_value;
  const initiatingNeighborId = banner._bb_initiatingneighbor_value;
  const recipientNeighborId = banner._bb_recipientneighbor_value;
  const includesGC = banner.bb_banneroption === 121120001;

  const [templateRes, initiatingRes, recipientRes, gcRes] = await Promise.allSettled([
    letterTemplateId
      ? dataverse.get<DvLetterTemplate>(`bb_lettertemplates(${letterTemplateId})?$select=bb_templatename,bb_bodyhtml`)
      : Promise.resolve(null),
    initiatingNeighborId
      ? dataverse.get<DvNeighborFull>(`bb_neighbors(${initiatingNeighborId})?$select=bb_firstname,bb_lastname,bb_phone,bb_email,bb_addressline1,bb_city,bb_state`)
      : Promise.resolve(null),
    recipientNeighborId
      ? dataverse.get<DvNeighborBasic>(`bb_neighbors(${recipientNeighborId})?$select=bb_firstname,bb_lastname`)
      : Promise.resolve(null),
    includesGC && banner._bb_order_value
      ? dataverse.get<{ value: DvOrderItem[] }>(
          `bb_orderitems?$filter=_bb_order_value eq '${banner._bb_order_value}' and bb_giftcertcode ne null` +
          `&$select=bb_giftcertcode,bb_unitprice&$top=1`
        )
      : Promise.resolve(null),
  ]);

  if (templateRes.status === 'rejected') console.error('Letter template fetch failed:', templateRes.reason);
  if (initiatingRes.status === 'rejected') console.error('Initiating neighbor fetch failed:', initiatingRes.reason);
  if (recipientRes.status === 'rejected') console.error('Recipient neighbor fetch failed:', recipientRes.reason);
  if (gcRes.status === 'rejected') console.error('GC fetch failed:', gcRes.reason);

  const template = templateRes.status === 'fulfilled' ? templateRes.value : null;
  const initiating = initiatingRes.status === 'fulfilled' ? initiatingRes.value : null;
  const recipient = recipientRes.status === 'fulfilled' ? recipientRes.value : null;
  const gcItem = gcRes.status === 'fulfilled' && gcRes.value
    ? (gcRes.value as { value: DvOrderItem[] }).value?.[0] ?? null
    : null;

  // Determine viewer role
  let viewerRole: 'in' | 'rn' | 'guest' = 'guest';
  if (userEmail && initiatingNeighborId) {
    try {
      const emailRes = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
        `bb_neighbors?$filter=bb_email eq '${userEmail}' and bb_neighborid eq '${initiatingNeighborId}' and statecode eq 0&$select=bb_neighborid&$top=1`
      );
      if ((emailRes.value?.length ?? 0) > 0) viewerRole = 'in';
    } catch {}
  }
  if (viewerRole === 'guest' && token) viewerRole = 'rn';

  return (
    <TransactionClient
      bannerId={banner.bb_bannerid}
      bannerNumber={banner.bb_bannernumber ?? ''}
      bannerOption={banner.bb_banneroption ?? 121120000}
      attributionType={banner.bb_attributiontype ?? ''}
      attributionName={banner.bb_attributionname ?? ''}
      attributionText={banner.bb_attributiontext ?? ''}
      noteIn={banner.bb_notein ?? ''}
      noteRn={banner.bb_notern ?? ''}
      shareName={banner.bb_sharename ?? false}
      sharePhone={banner.bb_sharephone ?? false}
      shareEmail={banner.bb_shareemail ?? false}
      shareAddress={banner.bb_shareaddress ?? false}
      beforePhotoUrl={banner.bb_beforephotourl ?? null}
      afterPhotoUrl={banner.bb_afterphotourl ?? null}
      attributionPhotoUrl={banner.bb_attributionphoto ?? ''}
      isPublicAttribution={banner.bb_ispublicattribution ?? false}
      letterPdfUrl={banner.bb_letterpdfurl ?? null}
      templateName={template?.bb_templatename ?? ''}
      templateBodyHtml={template?.bb_bodyhtml ?? ''}
      initiatingFirstName={initiating?.bb_firstname ?? ''}
      initiatingLastName={initiating?.bb_lastname ?? ''}
      initiatingPhone={initiating?.bb_phone ?? ''}
      initiatingEmail={initiating?.bb_email ?? ''}
      initiatingAddress={initiating?.bb_addressline1 ?? ''}
      initiatingCity={initiating?.bb_city ?? ''}
      initiatingState={initiating?.bb_state ?? ''}
      recipientFirstName={recipient?.bb_firstname ?? ''}
      recipientLastName={recipient?.bb_lastname ?? ''}
      gcCode={gcItem?.bb_giftcertcode ?? null}
      gcAmount={gcItem?.bb_unitprice ?? null}
      userEmail={userEmail}
      viewerRole={viewerRole}
    />
  );
}
