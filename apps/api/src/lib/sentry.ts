import * as Sentry from '@sentry/node';

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN || 'https://26de6472867f590a0477f6aade8a9b65@o4510530702147584.ingest.us.sentry.io/4510530704900096';
  
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Profiling (commented out - requires additional setup)
      // profilesSampleRate: 0.1,
      // integrations: [
      //   new ProfilingIntegration(),
      // ],
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out low-priority errors
        const error = hint.originalException;
        
        if (error instanceof Error) {
          // Don't send validation errors
          if (error.message.includes('ZodError') || error.message.includes('Validation')) {
            return null;
          }
          
          // Don't send 404s
          if (error.message.includes('404') || error.message.includes('Not Found')) {
            return null;
          }
        }
        
        return event;
      },
      
      // PII handling
      beforeBreadcrumb(breadcrumb) {
        // Redact sensitive data from breadcrumbs
        if (breadcrumb.category === 'http') {
          delete breadcrumb.data?.['authorization'];
          delete breadcrumb.data?.['cookie'];
        }
        return breadcrumb;
      },
    });
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // Log to console in development
    console.error('Error:', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  }
};

export const setUserContext = (user: { id: string; email?: string; clinicId?: string }) => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      clinic_id: user.clinicId,
    });
  }
};

export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}) => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

export { Sentry };
