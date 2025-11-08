// Payment configuration and test credit card constants
import { loadStripe } from '@stripe/stripe-js';

// Test Stripe Publishable Key (replace with your actual key)
const STRIPE_PUBLISHABLE_KEY = '';

// Initialize Stripe
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
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