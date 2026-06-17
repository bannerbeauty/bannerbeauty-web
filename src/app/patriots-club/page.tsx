import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import { getSidebarData } from '@/lib/community-sidebar';
import PatriotsClubClient from './PatriotsClubClient';

export const metadata = {
  title: "Patriot's Club | Banner Beauty",
};

export default async function PatriotsClubPage() {
  const session = await getSession();
  const neighborId = session?.neighborId ?? null;

  let isPatriotsClub = false;
  let bumpBalance = 0;
  let expiryDate = '';
  const sidebarData = neighborId ? await getSidebarData(neighborId) : null;

  if (neighborId) {
    try {
      const res = await dataverse.get<{ value: any[] }>(
        `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0` +
        `&$select=bb_neighborid,bb_ispatriotsclub,bb_bumpbalance,bb_patriotsclubexpiry` +
        `&$top=1`
      );
      const n = res.value?.[0];
      if (n) {
        isPatriotsClub = n.bb_ispatriotsclub ?? false;
        bumpBalance = n.bb_bumpbalance ?? 0;
        expiryDate = n.bb_patriotsclubexpiry ?? '';
      }
    } catch (err) {
      console.error('PatriotsClub fetch failed:', err);
    }
  }

  let annualPrice = 336;
  try {
    const priceRes = await dataverse.get<{ value: any[] }>(
      `bb_products?$filter=bb_productid eq 'da91acdf-3c67-f111-a826-6045bd065f56' and statecode eq 0&$select=bb_price&$top=1`
    );
    annualPrice = priceRes.value?.[0]?.bb_price ?? 336;
  } catch (err) {
    console.error('PatriotsClub price fetch failed:', err);
  }

  return (
    <PatriotsClubClient
      isLoggedIn={!!neighborId}
      neighborId={neighborId}
      isPatriotsClub={isPatriotsClub}
      bumpBalance={bumpBalance}
      expiryDate={expiryDate}
      sidebarData={sidebarData}
      annualPrice={annualPrice}
    />
  );
}
