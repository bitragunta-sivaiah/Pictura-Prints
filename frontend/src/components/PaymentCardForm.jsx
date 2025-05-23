import React, { useState } from 'react';
 import { CreditCardIcon } from 'lucide-react';
 import { toast } from 'react-hot-toast';

 const PaymentCardForm = ({ onPaymentDetailsChange }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberChange = (e) => {
  const value = e.target.value.replace(/\s/g, '');
  if (/^\d*$/.test(value)) {
  setCardNumber(value.substring(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
  onPaymentDetailsChange({ ...getPaymentDetails(), cardNumber: value });
  }
  };

  const handleExpiryDateChange = (e) => {
  const value = e.target.value.replace(/\s/g, '');
  if (/^\d*$/.test(value)) {
  let formattedValue = value.substring(0, 4);
  if (formattedValue.length > 2 && formattedValue[2] !== '/') {
  formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
  }
  setExpiryDate(formattedValue);
  onPaymentDetailsChange({ ...getPaymentDetails(), expiryDate: value });
  }
  };

  const handleCvvChange = (e) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) {
  setCvv(value.substring(0, 3));
  onPaymentDetailsChange({ ...getPaymentDetails(), cvv: value });
  }
  };

  const getPaymentDetails = () => ({
  cardNumber: cardNumber.replace(/\s/g, ''),
  expiryDate,
  cvv,
  });

  return (
  <div className="bg-white rounded-md shadow-md p-4 mt-2">
  <h3 className="text-lg font-semibold mb-3">Credit Card Details</h3>
  <div className="mb-3">
  <label htmlFor="cardNumber" className="block text-gray-700 text-sm font-bold mb-2">
  Card Number
  </label>
  <div className="relative">
  <input
  type="text"
  id="cardNumber"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="XXXX XXXX XXXX XXXX"
  value={cardNumber}
  onChange={handleCardNumberChange}
  maxLength="19"
  />
  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
  <CreditCardIcon className="h-5 w-5 text-gray-500" />
  </div>
  </div>
  </div>
  <div className="grid grid-cols-2 gap-4 mb-3">
  <div>
  <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">
  Expiry Date (MM/YY)
  </label>
  <input
  type="text"
  id="expiryDate"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="MM/YY"
  value={expiryDate}
  onChange={handleExpiryDateChange}
  maxLength="5"
  />
  </div>
  <div>
  <label htmlFor="cvv" className="block text-gray-700 text-sm font-bold mb-2">
  CVV
  </label>
  <input
  type="password"
  id="cvv"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="XXX"
  value={cvv}
  onChange={handleCvvChange}
  maxLength="3"
  />
  </div>
  </div>
  <p className="text-gray-500 text-xs italic">Your card details are securely processed.</p>
  </div>
  );
 };

 export default PaymentCardForm;