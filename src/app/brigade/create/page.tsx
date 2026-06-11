import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import BrigadeCreateClient from './BrigadeCreateClient';

export const metadata = {
  title: 'Create a Banner Brigade | Banner Beauty',
};

export default async function BrigadeCreatePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/brigade/create');
  }

  const userEmail = session.user.email;

  let neighborId: string | null = null;
  try {
    const res = await dataverse.get<{ value: { bb_neighborid: string }[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0&$select=bb_neighborid&$top=1`
    );
    neighborId = res.value?.[0]?.bb_neighborid ?? null;
  } catch (err) {
    console.error('BrigadeCreate neighbor fetch failed:', err);
  }

  if (!neighborId) redirect('/profile');

  return <BrigadeCreateClient neighborId={neighborId} />;
}
