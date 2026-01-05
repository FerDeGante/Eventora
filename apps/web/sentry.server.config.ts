import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://26de6472867f590a0477f6aade8a9b65@o4510530702147584.ingest.us.sentry.io/4510530704900096',
  
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Enable logs
  enableTracing: true,
  
  integrations: [
    // Console logging for server
    Sentry.consoleIntegration({ levels: ['warn', 'error'] }),
  ],
  
  beforeSend(event, hint) {
    // Don't send validation errors
    const error = hint.originalException;
    if (error instanceof Error && error.message.includes('Validation')) {
      return null;
    }
    return event;
  },
});
