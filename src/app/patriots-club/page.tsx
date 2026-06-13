import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import PatriotsClubClient from './PatriotsClubClient';

export const metadata = {
  title: "Patriot's Club | Banner Beauty",
};

export default async function PatriotsClubPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  let neighborId: string | null = null;
  let isPatriotsClub = false;
  let bumpBalance = 0;
  let expiryDate = '';
  const sidebarData = userEmail ? await getSidebarData(userEmail) : null;

  if (userEmail) {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0` +
        `&$select=bb_neighborid,bb_ispatriotsclub,bb_bumpbalance,bb_patriotsclubexpiry` +
        `&$top=1`
      );
      const n = res.value?.[0];
      if (n) {
        neighborId = n.bb_neighborid;
        isPatriotsClub = n.bb_ispatriotsclub ?? false;
        bumpBalance = n.bb_bumpbalance ?? 0;
        expiryDate = n.bb_patriotsclubexpiry ?? '';
      }
    } catch (err) {
      console.error('PatriotsClub fetch failed:', err);
    }
  }

  return (
    <PatriotsClubClient
      isLoggedIn={!!userEmail}
      neighborId={neighborId}
      isPatriotsClub={isPatriotsClub}
      bumpBalance={bumpBalance}
      expiryDate={expiryDate}
      sidebarData={sidebarData}
    />
  );
}
