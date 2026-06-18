import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import AnnouncementsClient from './AnnouncementsClient';

export interface AdminAnnouncement {
  announcementId: string;
  title: string;
  message: string;
  imageUrl: string;
  isActive: boolean;
  createdOn: string;
}

export default async function AdminAnnouncementsPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_announcements?$select=bb_announcementid,bb_title,bb_message,bb_imageurl,bb_isactive,createdon&$orderby=createdon desc`
    );

    const announcements: AdminAnnouncement[] = (res.value ?? []).map((a: any) => ({
      announcementId: a.bb_announcementid,
      title: a.bb_title ?? '',
      message: a.bb_message ?? '',
      imageUrl: a.bb_imageurl ?? '',
      isActive: a.bb_isactive ?? false,
      createdOn: a.createdon ?? '',
    }));

    return <AnnouncementsClient announcements={announcements} />;
  } catch (err) {
    console.error('Admin announcements fetch failed:', err);
    return <AnnouncementsClient announcements={[]} />;
  }
}
