module.exports = async function (context, req) {
  const rawKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const stripePublishableKey = (rawKey || '').trim();

  if (!stripePublishableKey) {
    context.log.warn('[runtime-config] STRIPE_PUBLISHABLE_KEY is not configured.');
  }

  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: {
      success: Boolean(stripePublishableKey),
      stripePublishableKey: stripePublishableKey || undefined,
      message: stripePublishableKey ? undefined : 'Stripe publishable key is not configured.'
    }
  };
};
