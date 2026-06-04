import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATAVERSE_URL: process.env.DATAVERSE_URL,
    DATAVERSE_TENANT_ID: process.env.DATAVERSE_TENANT_ID,
    DATAVERSE_CLIENT_ID: process.env.DATAVERSE_CLIENT_ID,
    DATAVERSE_CLIENT_SECRET: process.env.DATAVERSE_CLIENT_SECRET,
    BB_API_SECRET: process.env.BB_API_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AZURE_AD_B2C_TENANT_ID: process.env.AZURE_AD_B2C_TENANT_ID,
    AZURE_AD_B2C_CLIENT_ID: process.env.AZURE_AD_B2C_CLIENT_ID,
    AZURE_AD_B2C_CLIENT_SECRET: process.env.AZURE_AD_B2C_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
};

export default nextConfig;
