import type { NextRequest } from 'next/server';

const FLOW_URL =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/22ed87dc908e4eed949b11a66b56c051/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3kGoCibsJT15zBXJ9vWq4MulXigzm7U2P2215t7A1t4';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let flowRes: Response;
  try {
    flowRes = await fetch(FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bb-secret': process.env.BB_API_SECRET ?? '',
      },
      body: JSON.stringify({ payload: JSON.stringify(body) }),
    });
  } catch (err) {
    console.error('email-banner-bump flow error:', err);
    return Response.json({ error: 'Flow request failed' }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await flowRes.json();
  } catch {
    return Response.json({ error: 'Invalid flow response' }, { status: 502 });
  }

  if (!flowRes.ok) {
    return Response.json({ error: 'Flow returned an error', detail: data }, { status: flowRes.status });
  }

  return Response.json(data);
}
