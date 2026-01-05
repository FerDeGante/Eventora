import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Existing config
  images: {
    domains: ['localhost'],
  },
  
  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry build-time options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  
  // Upload sourcemaps only in production
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Disable automatic instrumentation injection
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
});
