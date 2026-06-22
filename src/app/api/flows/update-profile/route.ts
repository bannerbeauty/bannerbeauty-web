import type { NextRequest } from 'next/server';

const FLOW_URL =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5eee1a82ca3940dda8d57ac4eba2f42e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fokYFNkq2IdRsYfaWA8SnkDxHL_eUy4BrFcRrOkhrfQ';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
    console.log('[DEBUG update-profile] outgoing body:', JSON.stringify(body));
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
      body: JSON.stringify(body),
    });
    console.log('[DEBUG update-profile] flow response status:', flowRes.status);
  } catch (err) {
    console.error('update-profile flow error:', err);
    return Response.json({ error: 'Flow request failed' }, { status: 502 });
  }

  if (flowRes.status === 204 || flowRes.headers.get('content-length') === '0') {
    return Response.json({ success: true });
  }

  let data: unknown;
  try {
    data = await flowRes.json();
  } catch {
    // Empty body but non-204 — treat as success if status is ok
    if (flowRes.ok) return Response.json({ success: true });
    return Response.json({ error: 'Invalid flow response' }, { status: 502 });
  }

  if (!flowRes.ok) {
    return Response.json({ error: 'Flow returned an error', detail: data }, { status: flowRes.status });
  }

  return Response.json(data);
}
