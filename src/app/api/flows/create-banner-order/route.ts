import type { NextRequest } from 'next/server';

const FLOW_URL =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4c22cb7fbca541909fe5af2f75c095a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DeahDhxHlcPAjUEjX8exg_WRzYR0-srhqNoQ6lHD8zQ';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  console.log('BB_API_SECRET:', process.env.BB_API_SECRET ? 'set (' + process.env.BB_API_SECRET.substring(0, 8) + '...)' : 'MISSING');

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
    console.error('create-banner-order flow error:', err);
    return Response.json({ error: 'Flow request failed' }, { status: 502 });
  }

  console.log('Flow response status:', flowRes.status);
  const responseText = await flowRes.text();
  console.log('Flow response body:', responseText);

  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch {
    return Response.json({ error: 'Invalid flow response' }, { status: 502 });
  }

  if (!flowRes.ok) {
    return Response.json({ error: 'Flow returned an error', detail: data }, { status: flowRes.status });
  }

  return Response.json(data);
}
