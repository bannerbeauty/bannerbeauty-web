import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import ProfileClient from './ProfileClient';

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
  bb_preferredauthmethod?: number;
  bb_emailoptin?: boolean;
  bb_smsoptin?: boolean;
  bb_displayname?: string;
  bb_handle?: string;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/profile');
  }

  const userEmail = session.user.email;

  let neighbor: DvNeighbor | null = null;
  try {
    const res = await dataverse.get<{ value: DvNeighbor[] }>(
      `bb_neighbors?$filter=bb_email eq '${userEmail}' and statecode eq 0` +
      `&$select=bb_neighborid,bb_firstname,bb_lastname,bb_phone,bb_addressline1,bb_addressline2,bb_city,bb_state,bb_zipcode,bb_preferredauthmethod,bb_emailoptin,bb_smsoptin,bb_displayname,bb_handle` +
      `&$top=1`
    );
    neighbor = res.value?.[0] ?? null;
    console.log('Neighbor fetch result:', JSON.stringify(res.value?.[0] || 'no results'));
  } catch (err) {
    console.error('Profile neighbor fetch failed:', err);
  }

  return (
    <ProfileClient
      neighborId={neighbor?.bb_neighborid ?? null}
      userEmail={userEmail}
      firstName={neighbor?.bb_firstname ?? ''}
      lastName={neighbor?.bb_lastname ?? ''}
      phone={neighbor?.bb_phone ?? ''}
      address1={neighbor?.bb_addressline1 ?? ''}
      address2={neighbor?.bb_addressline2 ?? ''}
      city={neighbor?.bb_city ?? ''}
      state={neighbor?.bb_state ?? ''}
      zipcode={neighbor?.bb_zipcode ?? ''}
      preferredAuth={neighbor?.bb_preferredauthmethod != null ? String(neighbor.bb_preferredauthmethod) : '121120000'}
      emailOptin={neighbor?.bb_emailoptin ?? false}
      smsOptin={neighbor?.bb_smsoptin ?? false}
      displayName={neighbor?.bb_displayname ?? ''}
      handle={neighbor?.bb_handle ?? ''}
    />
  );
}
