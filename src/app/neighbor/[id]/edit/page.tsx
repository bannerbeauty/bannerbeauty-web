import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import NeighborEditClient from './NeighborEditClient';

export default async function NeighborEditPage({
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
  if (neighborId !== id) redirect(`/neighbor/${id}`);

  const sidebarData = await getSidebarData(neighborId);

  let neighbor = null;
  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${id}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_displayname,bb_handle,bb_description,bb_profileimageurl,bb_imageurl` +
      `&$top=1`
    );
    const n = res.value?.[0];
    if (!n) notFound();
    neighbor = {
      neighborId: n.bb_neighborid,
      displayName: n.bb_displayname ?? '',
      handle: n.bb_handle ?? '',
      description: n.bb_description ?? '',
      profileImageUrl: n.bb_profileimageurl ?? '',
      imageUrl: n.bb_imageurl ?? '',
    };
  } catch {
    notFound();
  }

  return (
    <NeighborEditClient
      neighbor={neighbor!}
      sidebarData={sidebarData}
    />
  );
}
