const DATAVERSE_URL = process.env.DATAVERSE_URL!;
const TOKEN_URL = `https://login.microsoftonline.com/${process.env.DATAVERSE_TENANT_ID}/oauth2/v2.0/token`;

let tokenCache: { token: string; expiresAt: number } | null = null;
let tokenPromise: Promise<string> | null = null;

async function fetchNewToken(): Promise<string> {
  const dataverseUrl = process.env.DATAVERSE_URL;
  console.log('dataverseUrl in fetchNewToken:', dataverseUrl);
  if (!dataverseUrl) throw new Error('DATAVERSE_URL environment variable is not set');
  const scope = `${dataverseUrl}/.default`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.DATAVERSE_CLIENT_ID!,
    client_secret: process.env.DATAVERSE_CLIENT_SECRET!,
    scope,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Token fetch failed:', res.status, errorText);
    throw new Error(`Token fetch failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const token: string = data.access_token;
  tokenCache = { token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token;
}

async function getAccessToken(): Promise<string> {
  if (tokenPromise) return tokenPromise;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 300_000) {
    return tokenCache.token;
  }

  tokenPromise = fetchNewToken().finally(() => { tokenPromise = null; });
  return tokenPromise;
}

function apiUrl(path: string): string {
  return `${DATAVERSE_URL}/api/data/v9.2/${path}`;
}

async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    ...extra,
  };
}

export const dataverse = {
  async get<T = unknown>(path: string, select?: string): Promise<T> {
    const url = select ? `${apiUrl(path)}?$select=${select}` : apiUrl(path);
    const res = await fetch(url, { headers: await authHeaders(), cache: 'no-store' });
    if (res.status === 401) {
      tokenCache = null;
      const retryRes = await fetch(url, { headers: await authHeaders(), cache: 'no-store' });
      if (!retryRes.ok) {
        throw new Error(`Dataverse GET ${path} failed: ${retryRes.status} ${await retryRes.text()}`);
      }
      return retryRes.json();
    }
    if (!res.ok) {
      throw new Error(`Dataverse GET ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  },

  async post<T = unknown>(entity: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(apiUrl(entity), {
      method: 'POST',
      headers: await authHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Dataverse POST ${entity} failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  },

  async patch(entity: string, id: string, body: Record<string, unknown>): Promise<void> {
    const res = await fetch(apiUrl(`${entity}(${id})`), {
      method: 'PATCH',
      headers: await authHeaders({ 'If-Match': '*' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Dataverse PATCH ${entity}(${id}) failed: ${res.status} ${await res.text()}`);
    }
  },
};
