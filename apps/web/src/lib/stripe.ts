// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET) {
  throw new Error('⚠️ Define STRIPE_SECRET en .env');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2025-04-30.basil',
});
