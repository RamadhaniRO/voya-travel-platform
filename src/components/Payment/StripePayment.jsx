import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../Button/Button';
import Card from '../Card/Card';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ amount, onSuccess, onError, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message);
        onError?.(error);
      } else {
        // Here you would typically send the payment method to your backend
        // For now, we'll simulate success
        onSuccess?.(paymentMethod);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-xl font-bold text-teal-600">${amount}</span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="large"
        loading={processing || loading}
        disabled={!stripe}
      >
        {processing ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError, loading = false }) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <Elements stripe={stripePromise}>
          <PaymentForm 
            amount={amount} 
            onSuccess={onSuccess} 
            onError={onError} 
            loading={loading}
          />
        </Elements>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            <p className="mb-2">🔒 Secure payment powered by Stripe</p>
            <p className="mb-2">💳 We accept all major credit cards</p>
            <p>🛡️ Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StripePayment;
