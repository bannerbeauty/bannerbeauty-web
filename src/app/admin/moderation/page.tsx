import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import ModerationClient from './ModerationClient';

const ADMIN_EMAIL = 'admin@bannerbeauty.com';

export interface ModerationBanner {
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  createdOn: string;
  attributionName: string;
  attributionText: string;
  attributionPhoto: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  noteIn: string;
  noteRn: string;
  isFeatureable: boolean;
  isRejected: boolean;
  recipientCity: string;
  recipientState: string;
}

export default async function ModerationPage() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) redirect('/');

  const fetchBanners = async (filter: string): Promise<ModerationBanner[]> => {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_banners?$filter=${filter} and statecode eq 0` +
        `&$select=bb_bannerid,bb_bannernumber,bb_banneroption,createdon,bb_attributionname,bb_attributiontext,bb_attributionphoto,bb_beforephotourl,bb_afterphotourl,bb_notein,bb_notern,bb_isfeatureable,bb_isrejected,bb_recipientcity,bb_recipientstate` +
        `&$orderby=createdon desc&$top=200`
      );
      return (res.value ?? []).map((b: any) => ({
        bannerId: b.bb_bannerid,
        bannerNumber: b.bb_bannernumber ?? '',
        bannerOption: b.bb_banneroption ?? 0,
        createdOn: b.createdon ?? '',
        attributionName: b.bb_attributionname ?? '',
        attributionText: b.bb_attributiontext ?? '',
        attributionPhoto: b.bb_attributionphoto ?? '',
        beforePhotoUrl: b.bb_beforephotourl ?? '',
        afterPhotoUrl: b.bb_afterphotourl ?? '',
        noteIn: b.bb_notein ?? '',
        noteRn: b.bb_notern ?? '',
        isFeatureable: b.bb_isfeatureable ?? false,
        isRejected: b.bb_isrejected ?? false,
        recipientCity: b.bb_recipientcity ?? '',
        recipientState: b.bb_recipientstate ?? '',
      }));
    } catch (err) {
      console.error('Moderation fetch failed:', err);
      return [];
    }
  };

  const [pending, approved, rejected] = await Promise.all([
    fetchBanners('bb_isfeatureable eq false and (bb_isrejected eq false or bb_isrejected eq null)'),
    fetchBanners('bb_isfeatureable eq true and (bb_isrejected eq false or bb_isrejected eq null)'),
    fetchBanners('bb_isrejected eq true'),
  ]);

  return (
    <ModerationClient
      pending={pending}
      approved={approved}
      rejected={rejected}
    />
  );
}
