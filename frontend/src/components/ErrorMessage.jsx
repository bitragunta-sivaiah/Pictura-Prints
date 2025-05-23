import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-48 bg-red-100 text-red-700 rounded-md p-4 shadow-md">
    <svg
      className="w-12 h-12 mb-2 fill-current text-red-500"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
    <p className="font-semibold">{message || 'An error occurred.'}</p>
    {message && <p className="text-sm mt-1">Please try again later.</p>}
  </div>
);

export default ErrorMessage;