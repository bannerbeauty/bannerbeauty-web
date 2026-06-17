import { getSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Sign out error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
