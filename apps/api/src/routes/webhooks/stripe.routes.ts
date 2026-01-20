import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { env } from "../../lib/env";
import { stripe } from "../../lib/stripe";
import { handleCheckoutCompleted } from "../../modules/payments/payment.service";
import * as onboardingService from "../../modules/onboarding/onboarding.service";
import * as connectService from "../../modules/connect/connect.service";

export async function stripeWebhookRoutes(app: FastifyInstance) {
  app.post("/stripe", async (request, reply) => {
    const signature = request.headers["stripe-signature"] as string | undefined;
    if (!signature) {
      return reply.status(400).send({ message: "Missing stripe-signature header" });
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      return reply.status(400).send({ message: "Missing raw body" });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      request.log.error({ err }, "Invalid stripe webhook signature");
      return reply.status(400).send({ message: err.message });
    }

    try {
      switch (event.type) {
        // Payment events
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          // Check if it's a SaaS subscription or a workspace payment
          if (session.mode === "subscription") {
            await onboardingService.handleCheckoutCompleted(session);
          } else {
            await handleCheckoutCompleted(session);
          }
          break;
        }

        // Subscription events (SaaS billing)
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await onboardingService.handleSubscriptionUpdated(subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await onboardingService.handleSubscriptionDeleted(subscription);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await onboardingService.handleInvoicePaymentFailed(invoice);
          break;
        }

        // Connect events (workspace payments)
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          await connectService.handleAccountUpdated(account);
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Only handle if it's a Connect payment (has transfer_data)
          if (paymentIntent.transfer_data) {
            await connectService.handlePaymentIntentSucceeded(paymentIntent);
          }
          break;
        }

        default:
          request.log.info({ type: event.type }, "Unhandled Stripe event type");
      }
    } catch (err: any) {
      request.log.error({ err, eventType: event.type }, "Error processing stripe webhook");
      return reply.status(500).send({ message: err.message });
    }

    return reply.send({ received: true });
  });
}
