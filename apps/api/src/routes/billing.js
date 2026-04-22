import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /billing/current-plan - Get current billing plan
router.get('/current-plan', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const user = await pb.collection('users').getOne(userId);

  if (!user.stripe_customer_id) {
    return res.json({
      planName: 'Free',
      price: 0,
      billingCycle: null,
      renewalDate: null,
      stripeCustomerId: null,
    });
  }

  const customer = await stripe.customers.retrieve(user.stripe_customer_id);

  if (!customer.subscriptions || customer.subscriptions.data.length === 0) {
    return res.json({
      planName: 'Free',
      price: 0,
      billingCycle: null,
      renewalDate: null,
      stripeCustomerId: user.stripe_customer_id,
    });
  }

  const subscription = customer.subscriptions.data[0];
  const plan = subscription.items.data[0].price;

  res.json({
    planName: plan.nickname || 'Premium',
    price: plan.unit_amount / 100,
    billingCycle: plan.recurring.interval,
    renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
    stripeCustomerId: user.stripe_customer_id,
  });
});

export default router;
