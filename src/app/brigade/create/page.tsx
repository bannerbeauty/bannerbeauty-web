import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import BrigadeCreateClient from './BrigadeCreateClient';

export const metadata = {
  title: 'Create a Banner Brigade | Banner Beauty',
};

export default async function BrigadeCreatePage() {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  return <BrigadeCreateClient neighborId={neighborId} />;
}
