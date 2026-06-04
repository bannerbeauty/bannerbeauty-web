import type { NextRequest } from 'next/server';

const FLOW_URL =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/b49b8e1dcea24557842772c376a08d12/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=H-oT5W7hO9ih1QTUjQc2HqmIE9Fh_5oFPqICrmaDT-E';

export async function POST(req: NextRequest) {
  let gcCode: string;
  let orderId: string;
  try {
    const body = await req.json();
    gcCode = body.gcCode ?? '';
    orderId = body.orderId ?? '';
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!gcCode) {
    return Response.json({ error: 'gcCode is required' }, { status: 400 });
  }

  let flowRes: Response;
  try {
    flowRes = await fetch(FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bb-secret': process.env.BB_API_SECRET ?? '',
      },
      body: JSON.stringify({ payload: JSON.stringify({ gcCode, orderId }) }),
    });
  } catch (err) {
    console.error('GC validate flow error:', err);
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
