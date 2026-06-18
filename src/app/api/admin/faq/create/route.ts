import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { question, answer } = await req.json();
    if (!question || !answer) return Response.json({ error: 'Missing fields' }, { status: 400 });
    const result = await dataverse.post('bb_faqs', {
      bb_question: question,
      bb_answerformatted: answer,
    }) as Record<string, string>;
    return Response.json({ ok: true, faqId: result.bb_faqid });
  } catch (err) {
    console.error('Create FAQ failed:', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
