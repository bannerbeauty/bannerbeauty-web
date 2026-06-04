import NextAuth from 'next-auth';

const TENANT_ID = 'e4e9c8f5-b376-40a3-8451-3f216b8a2878';
const CLIENT_ID = 'c43c292b-1b08-4d2e-9045-b33eb96efc41';
const b2cBase = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0`;

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    {
      id: 'azure-ad-b2c',
      name: 'BannerBeauty',
      type: 'oidc',
      issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      clientId: CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      authorization: {
        url: `${b2cBase}/authorize`,
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      token: `${b2cBase}/token`,
      userinfo: `${b2cBase}/userinfo`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
          email: profile.emails?.[0] ?? profile.email ?? null,
          image: null,
        };
      },
    },
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub as string;
        token.emails = (profile as Record<string, unknown>).emails;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    },
  },
});
