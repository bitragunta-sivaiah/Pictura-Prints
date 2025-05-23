// Spinner.jsx
import React from 'react';
 

const Spinner = ({ size = 24, color = 'blue-500' }) => {
  return (
    <div
      className={`inline-block w-{size} h-{size} border-[3px] border-t-${color} rounded-full animate-spin`}
    ></div>
  );
};

export default Spinner;