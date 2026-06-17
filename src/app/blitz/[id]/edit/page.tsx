import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import BlitzEditClient from './BlitzEditClient';

export default async function BlitzEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  let blitz = null;
  try {
    const blitzRes = await dataverse.get<{ value: any[] }>(
      `bb_blitzs?$filter=bb_blitzid eq '${id}' and statecode eq 0` +
      `&$select=bb_blitzid,bb_name,bb_description,bb_datestart,bb_dateend,bb_imageurl,_bb_owner_value` +
      `&$top=1`
    );
    const b = blitzRes.value?.[0];
    if (!b) notFound();

    // Check owner or blitz admin
    const isOwner = b._bb_owner_value === neighborId;
    let isAdmin = false;
    if (!isOwner) {
      const adminRes = await dataverse.get<{ value: any[] }>(
        `bb_blitzadmins?$filter=_bb_blitz_value eq '${id}' and _bb_neighbor_value eq '${neighborId}' and statecode eq 0&$select=bb_blitzadminid&$top=1`
      );
      isAdmin = (adminRes.value?.length ?? 0) > 0;
    }
    if (!isOwner && !isAdmin) redirect(`/blitz/${id}`);

    blitz = {
      blitzId: b.bb_blitzid,
      name: b.bb_name ?? '',
      description: b.bb_description ?? '',
      dateStart: b.bb_datestart ?? '',
      dateEnd: b.bb_dateend ?? '',
      imageUrl: b.bb_imageurl ?? '',
    };
  } catch {
    notFound();
  }

  const sidebarData = await getSidebarData(neighborId);

  return (
    <BlitzEditClient
      blitz={blitz!}
      sidebarData={sidebarData}
    />
  );
}
