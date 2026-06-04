export async function GET() {
  return Response.json({
    dataverseUrl: process.env.DATAVERSE_URL ? 'set' : 'MISSING',
    clientId: process.env.DATAVERSE_CLIENT_ID ? 'set' : 'MISSING',
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET ? 'set' : 'MISSING',
    tenantId: process.env.DATAVERSE_TENANT_ID ? 'set' : 'MISSING',
    bbSecret: process.env.BB_API_SECRET ? 'set' : 'MISSING',
  });
}
