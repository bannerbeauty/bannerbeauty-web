import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return Response.json({ isLoggedIn: false });
    }
    return Response.json({
      isLoggedIn: true,
      neighborId: session.neighborId,
      phone: session.phone,
      isAdmin: session.isAdmin ?? false,
    });
  } catch {
    return Response.json({ isLoggedIn: false });
  }
}
