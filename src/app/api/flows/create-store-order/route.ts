import type { NextRequest } from 'next/server';

const FLOW_URL =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/45637e453fef4ac9b0bf0bba5fac002e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ydQ4aG-Ug3J355hoMQEVl_02GNCgxY5NojYRc6csQAw';

const RUN_BASE =
  'https://2e1e3024670eed439dc2d049ff5827.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/45637e453fef4ac9b0bf0bba5fac002e/runs';

async function pollRunResult(runId: string, secret: string, maxAttempts = 20, intervalMs = 2000): Promise<unknown> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const statusRes = await fetch(`${RUN_BASE}/${runId}?api-version=1`, {
      headers: {
        'x-bb-secret': secret,
        'Content-Type': 'application/json',
      },
    });

    if (!statusRes.ok) continue;

    const statusData = await statusRes.json() as {
      properties?: {
        status?: string;
        outputs?: unknown;
        response?: { body?: unknown; status?: string };
      };
    };

    const status = statusData?.properties?.status;

    if (status === 'Succeeded') {
      return statusData?.properties?.response?.body ?? statusData?.properties?.outputs ?? { success: true };
    }

    if (status === 'Failed' || status === 'Cancelled') {
      throw new Error(`Flow run ${status}`);
    }
  }
  throw new Error('Flow polling timed out');
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let runId: string;
  try {
    const flowRes = await fetch(FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bb-secret': process.env.BB_API_SECRET ?? '',
      },
      body: JSON.stringify({ payload: JSON.stringify(body) }),
    });

    const runData = await flowRes.json() as { name?: string };
    runId = runData?.name ?? '';
    if (!runId) throw new Error('No run ID returned');
  } catch (err) {
    console.error('create-store-order invoke error:', err);
    return Response.json({ error: 'Flow request failed' }, { status: 502 });
  }

  try {
    const result = await pollRunResult(runId, process.env.BB_API_SECRET ?? '');
    return Response.json(result);
  } catch (err) {
    console.error('create-store-order poll error:', err);
    return Response.json({ error: 'Flow polling failed' }, { status: 502 });
  }
}
