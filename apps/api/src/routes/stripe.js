import express from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { PRICING_PLANS } from '../constants/pricing.js';
import emailService from '../services/emailService.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// POST /stripe/create-checkout-session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { planId, billingCycle, projectId } = req.body;
  const userId = req.user.id;

  if (!planId || !billingCycle) {
    throw new Error('planId and billingCycle are required');
  }

  const plan = PRICING_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan selected');
  }

  const priceId = billingCycle === 'annual' ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
  const priceAmount = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

  // Fetch user to get email
  const user = await pb.collection('users').getOne(userId);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `TrackMyScaffolding ${plan.name} Plan (${billingCycle})`,
          },
          unit_amount: priceAmount * 100, // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer_email: user.email,
    metadata: {
      userId,
      projectId: projectId || '',
      planId,
      billingCycle
    },
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
  });

  res.json({ sessionId: session.id, checkoutUrl: session.url });
});

// GET /stripe/verify-session
router.get('/verify-session', authMiddleware, async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    throw new Error('Payment not completed');
  }

  const { planId, billingCycle, userId, projectId } = session.metadata;
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update user record
  const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
  
  await pb.collection('users').update(userId, {
    stripeCustomerId: session.customer,
    subscriptionId: session.subscription,
    planId,
    billingCycle,
    renewalDate
  });

  // Create subscription audit record
  await pb.collection('subscriptions').create({
    userId,
    projectId: projectId || 'default',
    stripeSubscriptionId: session.subscription,
    planId,
    billingCycle,
    status: subscription.status,
    startDate: new Date(subscription.current_period_start * 1000).toISOString(),
    renewalDate,
    amount: session.amount_total / 100,
    currency: session.currency
  });

  res.json({ 
    success: true, 
    planId, 
    billingCycle, 
    renewalDate, 
    planName: PRICING_PLANS[planId]?.name || planId 
  });
});

// GET /stripe/customer-portal
router.get('/customer-portal', authMiddleware, async (req, res) => {
  const user = await pb.collection('users').getOne(req.user.id);
  
  if (!user.stripeCustomerId) {
    throw new Error('No active subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings/billing`,
  });

  res.json({ portalUrl: session.url });
});

// GET /stripe/invoices
router.get('/invoices', authMiddleware, async (req, res) => {
  const user = await pb.collection('users').getOne(req.user.id);
  
  if (!user.stripeCustomerId) {
    return res.json([]);
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 50,
  });

  res.json(invoices.data);
});

// GET /stripe/current-plan
router.get('/current-plan', authMiddleware, async (req, res) => {
  const user = await pb.collection('users').getOne(req.user.id);
  
  res.json({
    planName: user.planId || 'Free',
    price: user.planId ? PRICING_PLANS[user.planId]?.[user.billingCycle === 'annual' ? 'annualPrice' : 'monthlyPrice'] : 0,
    billingCycle: user.billingCycle || null,
    renewalDate: user.renewalDate || null,
    stripeCustomerId: user.stripeCustomerId || null
  });
});

// POST /stripe/webhook - Handle Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.warn('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Construct event from raw body
    const rawBody = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      
      // Get customer ID from payment intent
      const customerId = paymentIntent.customer;
      
      if (!customerId) {
        logger.warn('Payment intent succeeded but no customer ID found');
        break;
      }

      // Query users collection to find user with matching stripeCustomerId
      const users = await pb.collection('users').getFullList({
        filter: `stripeCustomerId="${customerId}"`
      });

      if (users.length === 0) {
        logger.warn(`No user found for Stripe customer ${customerId}`);
        break;
      }

      const user = users[0];
      const userLanguage = user.language || 'en';

      // Get subscription details
      let subscriptionDetails = {
        planName: 'Unknown',
        amount: paymentIntent.amount / 100, // Convert from cents to euros
        currency: paymentIntent.currency?.toUpperCase() || 'EUR',
        billingPeriod: null,
        nextBillingDate: null
      };

      // If user has a subscription, get more details
      if (user.subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        const plan = PRICING_PLANS[user.planId];
        
        subscriptionDetails = {
          planName: plan?.name || user.planId || 'Premium',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency?.toUpperCase() || 'EUR',
          billingPeriod: subscription.items.data[0]?.price?.recurring?.interval || 'month',
          nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString()
        };
      }

      // Send payment confirmation email
      const accountUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`;
      const emailResult = await emailService.sendPaymentConfirmationEmail({
        to: user.email,
        firstName: user.full_name || 'User',
        planName: subscriptionDetails.planName,
        amount: subscriptionDetails.amount.toFixed(2),
        billingPeriod: subscriptionDetails.billingPeriod || 'monthly',
        nextBillingDate: subscriptionDetails.nextBillingDate ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() : 'N/A',
        accountUrl,
        userId: user.id,
      });

      if (emailResult.success) {
        logger.info(`Payment confirmation email sent to user ${user.id} (${user.email})`);
      } else {
        logger.error(`Failed to send payment confirmation email to user ${user.id}: ${emailResult.error}`);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      // Find user by stripeCustomerId
      const users = await pb.collection('users').getFullList({
        filter: `stripeCustomerId="${subscription.customer}"`
      });
      
      if (users.length > 0) {
        const user = users[0];
        
        if (event.type === 'customer.subscription.deleted' || subscription.status === 'canceled') {
          await pb.collection('users').update(user.id, {
            planId: '',
            billingCycle: '',
            subscriptionId: '',
            renewalDate: null
          });
        } else {
          await pb.collection('users').update(user.id, {
            renewalDate: new Date(subscription.current_period_end * 1000).toISOString()
          });
        }
        
        // Update subscription audit record
        const subRecords = await pb.collection('subscriptions').getFullList({
          filter: `stripeSubscriptionId="${subscription.id}"`
        });
        
        if (subRecords.length > 0) {
          await pb.collection('subscriptions').update(subRecords[0].id, {
            status: subscription.status,
            renewalDate: new Date(subscription.current_period_end * 1000).toISOString()
          });
        }
      }
      break;
    }

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
