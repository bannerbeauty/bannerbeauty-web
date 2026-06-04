export async function GET() {
  return Response.json({
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'set' : 'MISSING',
    nextauthUrl: process.env.NEXTAUTH_URL || 'MISSING',
    b2cSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET ? 'set' : 'MISSING',
    b2cClientId: process.env.AZURE_AD_B2C_CLIENT_ID || 'MISSING',
    b2cTenantId: process.env.AZURE_AD_B2C_TENANT_ID || 'MISSING',
  });
}
