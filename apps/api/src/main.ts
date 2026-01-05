import Fastify from "fastify";
import rawBody from "fastify-raw-body";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import { env } from "./lib/env";
import tenantPlugin from "./plugins/tenant";
import jwtPlugin from "./plugins/jwt";
import securityPlugin from "./plugins/security";
import swaggerPlugin from "./plugins/swagger";
import { clinicRoutes } from "./modules/clinics/clinic.routes";
import { catalogRoutes } from "./modules/catalog/catalog.routes";
import { reservationRoutes } from "./modules/reservations/reservation.routes";
import { availabilityRoutes } from "./modules/availability/availability.routes";
import { userRoutes } from "./modules/users/user.routes";
import { paymentRoutes } from "./modules/payments/payment.routes";
import { notificationRoutes } from "./modules/notifications/notification.routes";
import { notificationTemplateRoutes } from "./modules/notifications/notificationTemplate.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { userPackageRoutes } from "./modules/user-packages/userPackage.routes";
import { reportRoutes } from "./modules/reports/report.routes";
import { publicRoutes } from "./modules/marketplace/public.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { posTerminalRoutes } from "./modules/pos/terminal.routes";
import { posPrinterRoutes } from "./modules/pos/printer.routes";
import { cashShiftRoutes } from "./modules/pos/cashShift.routes";
import { printJobRoutes } from "./modules/pos/printJob.routes";
import { posTicketRoutes } from "./modules/pos/ticket.routes";
import { posBranchRoutes } from "./modules/pos/branch.routes";
import { calendarRoutes } from "./modules/calendar/calendar.routes";
import { googleIntegrationRoutes } from "./modules/integrations/google.routes";
import { whatsappRoutes } from "./modules/notifications/whatsapp.routes";
import { stripeWebhookRoutes } from "./routes/webhooks/stripe.routes";
import { mercadoPagoWebhookRoutes } from "./routes/webhooks/mercadopago.routes";
import onboardingRoutes from "./modules/onboarding/onboarding.routes";
import membershipRoutes from "./modules/memberships/membership.routes";
import connectRoutes from "./modules/connect/connect.routes";
import productRoutes from "./modules/products/product.routes";
import { getTenantContext } from "./lib/tenant-context";
import { logger } from "./lib/logger";
import { initSentry } from "./lib/sentry";

dotenv.config();

// Initialize Sentry
initSentry();

const app = Fastify({ logger });

const registerPlugins = async () => {
  await app.register(securityPlugin);

  await app.register(rawBody, {
    field: "rawBody",
    global: true,
    encoding: "utf8",
    runFirst: true,
  });

  await app.register(tenantPlugin);
  await app.register(jwtPlugin);
  
  // Register Swagger only in development (temporarily disabled due to version mismatch)
  // if (env.NODE_ENV !== 'production') {
  //   await app.register(swaggerPlugin);
  // }
};

const registerRoutes = () => {
  app.get("/health", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      service: "eventora-api",
      timestamp: new Date().toISOString(),
    };
  });

  // Sentry test endpoint
  app.get("/test-sentry", async () => {
    const { captureException, captureMessage } = await import("./lib/sentry");
    
    captureMessage("🧪 Test message from Eventora API", "info");
    
    try {
      throw new Error("🔥 Test error from Eventora API - This is intentional!");
    } catch (error) {
      captureException(error as Error, {
        testContext: true,
        endpoint: "/test-sentry",
        timestamp: new Date().toISOString(),
      });
      throw error; // Re-throw to see in logs too
    }
  });

  app.register(
    async (instance) => {
      // Public routes (no auth)
      instance.register(authRoutes, { prefix: "/auth" });
      instance.register(publicRoutes, { prefix: "/public" });
      instance.register(onboardingRoutes, { prefix: "/onboarding" });
      instance.register(clinicRoutes, { prefix: "/clinics" });

      instance.register(async (secure) => {
        secure.addHook("onRequest", secure.authenticate as any);

        secure.register(catalogRoutes, { prefix: "/catalog" });
        secure.register(availabilityRoutes, { prefix: "/availability" });
        secure.register(reservationRoutes, { prefix: "/reservations" });
        secure.register(userRoutes, { prefix: "/users" });
        secure.register(paymentRoutes, { prefix: "/payments" });
        secure.register(notificationRoutes, { prefix: "/notifications" });
        secure.register(notificationTemplateRoutes, { prefix: "/notifications/templates" });
        secure.register(userPackageRoutes, { prefix: "/user-packages" });
        secure.register(reportRoutes, { prefix: "/reports" });
        secure.register(dashboardRoutes, { prefix: "/dashboard" });
        secure.register(posTerminalRoutes, { prefix: "/pos/terminals" });
        secure.register(posPrinterRoutes, { prefix: "/pos/printers" });
        secure.register(cashShiftRoutes, { prefix: "/pos/cash-shifts" });
        secure.register(printJobRoutes, { prefix: "/pos/print-jobs" });
        secure.register(posTicketRoutes, { prefix: "/pos/tickets" });
        secure.register(posBranchRoutes, { prefix: "/pos/branches" });
        secure.register(calendarRoutes, { prefix: "/calendar" });
        secure.register(googleIntegrationRoutes, { prefix: "/integrations/google" });
        secure.register(whatsappRoutes, { prefix: "/notifications/whatsapp" });
        secure.register(membershipRoutes, { prefix: "/memberships" });
        secure.register(connectRoutes, { prefix: "/connect" });
        secure.register(productRoutes, { prefix: "/products" });
      });
    },
    { prefix: "/api/v1" },
  );

  app.register(
    async (instance) => {
      instance.register(stripeWebhookRoutes, { prefix: "/stripe" });
      instance.register(mercadoPagoWebhookRoutes, { prefix: "/mercadopago" });
    },
    { prefix: "/api/webhooks" },
  );
};

const start = async () => {
  await registerPlugins();
  registerRoutes();

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      message: error.message,
      clinicId: getTenantContext()?.clinicId,
    });
  });

  const port = env.PORT;
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    app.log.info(`API listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error({ err }, "Failed to start API");
    process.exit(1);
  }
};

void start();
