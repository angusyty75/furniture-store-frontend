// Payment configuration and test credit card constants
import { loadStripe } from '@stripe/stripe-js';

const RUNTIME_CONFIG_ENDPOINT = '/api/runtime-config';

const getEnvStripeKey = () => (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();

let stripePromise;
let stripeKeyPromise;

const fetchRuntimeStripeKey = async () => {
  if (typeof window === 'undefined') return '';

  try {
    const response = await fetch(RUNTIME_CONFIG_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Unexpected runtime config response: ${response.status}`);
    }
    const data = await response.json();
    return (data?.stripePublishableKey || '').trim();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[payment] Failed to load runtime Stripe config', err);
    }
    return '';
  }
};

const resolveStripePublishableKey = async () => {
  if (!stripeKeyPromise) {
    stripeKeyPromise = (async () => {
      const envKey = getEnvStripeKey();
      if (envKey) {
        return envKey;
      }
      return await fetchRuntimeStripeKey();
    })();
  }

  return stripeKeyPromise;
};

// Initialize Stripe lazily so we can fetch the runtime key when needed.
export const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = await resolveStripePublishableKey();
    if (!publishableKey) {
      if (import.meta.env.DEV) {
        console.error('[payment] Stripe publishable key is not configured.');
      }
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Test Credit Card Numbers (for development)
export const TEST_CARDS = {
  VISA: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User'
  },
  VISA_DEBIT: {
    number: '4000056655665556',
    expiry: '12/25', 
    cvc: '123',
    name: 'Test User'
  },
  MASTERCARD: {
    number: '5555555555554444',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User'
  },
  AMEX: {
    number: '378282246310005',
    expiry: '12/25',
    cvc: '1234',
    name: 'Test User'
  }
};

// Default test card for auto-fill
export const DEFAULT_TEST_CARD = TEST_CARDS.VISA;

// Payment configuration
export const PAYMENT_CONFIG = {
  currency: 'HKD',
  supportedPaymentMethods: ['credit_card', 'wechat_pay', 'alipay_hk'],
  stripeConfig: {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2c3e50',
        colorBackground: '#ffffff',
        colorText: '#2c3e50',
        colorDanger: '#e74c3c',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    },
    elements: {
      card: {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '16px',
            color: '#2c3e50',
            '::placeholder': {
              color: '#6c757d'
            }
          },
          invalid: {
            color: '#e74c3c'
          }
        }
      }
    }
  },
  wechatConfig: {
    sandbox: true,
    theme: {
      primaryColor: '#07C160',
      backgroundColor: '#f8f9fa'
    }
  },
  alipayConfig: {
    sandbox: true,
    theme: {
      primaryColor: '#1677ff',
      backgroundColor: '#f8f9fa'
    }
  }
};

export default {
  getStripe,
  TEST_CARDS,
  DEFAULT_TEST_CARD,
  PAYMENT_CONFIG
};