import type { NextRequest } from 'next/server';
import { dataverse } from '@/lib/dataverse';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');
  const neighborId = req.nextUrl.searchParams.get('neighborId');

  if (!handle) return Response.json({ available: false });

  try {
    const filter = neighborId
      ? `bb_handle eq '${handle}' and bb_neighborid ne '${neighborId}'`
      : `bb_handle eq '${handle}'`;

    const result = await dataverse.get<{ value: unknown[] }>(
      `bb_neighbors?$filter=${filter}&$select=bb_neighborid&$top=1`
    );

    return Response.json({ available: result.value.length === 0 });
  } catch {
    return Response.json({ available: true });
  }
}
