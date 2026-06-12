import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
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

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=/blitz/${id}/edit`);
  }

  const userEmail = session.user.email;

  let neighborId: string | null = null;
  try {
    const res = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0&$select=bb_neighborid&$top=1`
    );
    neighborId = res.value?.[0]?.bb_neighborid ?? null;
  } catch {}

  if (!neighborId) redirect(`/blitz/${id}`);

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

  const sidebarData = await getSidebarData(userEmail);

  return (
    <BlitzEditClient
      blitz={blitz!}
      sidebarData={sidebarData}
    />
  );
}
