import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { faqId } = await req.json();
    if (!faqId) return Response.json({ error: 'Missing faqId' }, { status: 400 });
    await dataverse.patch('bb_faqs', faqId, { statecode: 1 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Delete FAQ failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
