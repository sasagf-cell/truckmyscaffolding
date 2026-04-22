
export const PRICING_PLANS = {
  Starter: {
    id: 'Starter',
    name: 'Starter',
    monthlyPrice: 19,
    annualPrice: 228,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly_mock',
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual_mock',
    features: [
      'Up to 10 active scaffolds',
      'Basic scaffold requests',
      'Site diary',
      'Material tracking',
      '1 project',
      'Email support'
    ]
  },
  Professional: {
    id: 'Professional',
    name: 'Professional',
    monthlyPrice: 49,
    annualPrice: 588,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_mock',
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_mock',
    features: [
      'Unlimited scaffolds',
      'AI assistant with alerts',
      'Subcontractor invites',
      'Advanced reports',
      'Up to 3 projects',
      'Priority email support',
      'CSV import/export',
      'Custom scaffold numbering'
    ]
  },
  Enterprise: {
    id: 'Enterprise',
    name: 'Enterprise',
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceIdMonthly: '',
    stripePriceIdAnnual: '',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Multi-user access',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      'Free migration support'
    ]
  }
};
