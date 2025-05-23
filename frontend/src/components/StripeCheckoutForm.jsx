// components/StripeCheckoutForm.jsx
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createStripePaymentIntent } from '../store/orderSlice'; // Assuming you have this thunk
import { toast } from 'react-hot-toast';
import { Loader2Icon } from 'lucide-react';

const StripeCheckoutForm = ({ orderId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const error = useSelector((state) => state.order.error); // Adjust selector as needed
  const stripeStatus = useSelector((state) => state.order.createStripeSessionStatus);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js is loaded.
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      toast.error(stripeError.message);
      setProcessing(false);
      return;
    }

    const result = await dispatch(
      createStripePaymentIntent({
        orderId: orderId,
        amount: amount, // Amount in cents
        paymentMethodId: paymentMethod.id,
      })
    );

    if (result.payload?.clientSecret) {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        result.payload.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can collect and send billing details here if needed
            },
          },
        }
      );

      if (confirmError) {
        toast.error(confirmError.message);
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        navigate(`/order/${orderId}`);
        // Optionally dispatch an action to update order status on your frontend
      } else {
        toast.error('Payment failed.');
      }
    } else {
      toast.error(result.error || 'Failed to initiate payment.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="border rounded-md p-3 mb-3">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing || stripeStatus === 'loading'}
        className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${
          processing || stripeStatus === 'loading' ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {processing || stripeStatus === 'loading' ? (
          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          'Pay with Stripe'
        )}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </form>
  );
};

export default StripeCheckoutForm;