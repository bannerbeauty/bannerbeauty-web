import { auth } from '@/lib/auth';
import { dataverse } from '@/lib/dataverse';
import BrigadesClient from './BrigadesClient';

const BRIGADE_TYPE_LABELS: Record<number, string> = {
  121120000: 'Law Enforcement',
  121120001: 'Fire & Rescue',
  121120002: 'Medical',
  121120003: 'Military Unit',
  121120004: 'Veteran Organization',
  121120005: 'Civic Organization',
  121120006: 'School or University',
  121120007: 'Club or Association',
  121120008: 'Other',
};

const BRIGADE_SCOPE_LABELS: Record<number, string> = {
  121120000: 'Nationwide',
  121120001: 'Statewide',
  121120002: 'Countywide',
  121120003: 'Citywide',
  121120004: 'Neighborhood',
  121120005: 'Custom',
};

export interface BrigadeListItem {
  brigadeId: string;
  brigadeNumber: string;
  name: string;
  brigadeType: number;
  brigadeScope: number;
  brigadeState: string;
  brigadeCity: string;
  description: string;
  profileImageUrl: string;
  isVerified: boolean;
  createdOn: string;
  typeLabel: string;
  scopeLabel: string;
}

export default async function BrigadesPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.email;

  let brigades: BrigadeListItem[] = [];

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_brigades?$filter=statecode eq 0` +
      `&$select=bb_brigadeid,bb_brigadenumber,bb_name,bb_brigadetype,bb_brigadescope,bb_brigadestate,bb_brigadecity,bb_description,bb_profileimageurl,bb_isverified,createdon` +
      `&$orderby=bb_name asc`
    );

    brigades = (res.value ?? []).map((b: any) => ({
      brigadeId: b.bb_brigadeid,
      brigadeNumber: b.bb_brigadenumber,
      name: b.bb_name,
      brigadeType: b.bb_brigadetype,
      brigadeScope: b.bb_brigadescope,
      brigadeState: b.bb_brigadestate ?? '',
      brigadeCity: b.bb_brigadecity ?? '',
      description: b.bb_description ?? '',
      profileImageUrl: b.bb_profileimageurl ?? '',
      isVerified: b.bb_isverified ?? false,
      createdOn: b.createdon ?? '',
      typeLabel: BRIGADE_TYPE_LABELS[b.bb_brigadetype] ?? 'Other',
      scopeLabel: BRIGADE_SCOPE_LABELS[b.bb_brigadescope] ?? '',
    }));
  } catch (err) {
    console.error('Brigades fetch failed:', err);
  }

  return (
    <BrigadesClient
      brigades={brigades}
      isLoggedIn={isLoggedIn}
    />
  );
}
