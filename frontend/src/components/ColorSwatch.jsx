import React from 'react';

const ColorSwatch = ({ color, size = 'md' }) => {
  const sizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div
      className={`rounded-full shadow-sm border border-gray-300 cursor-pointer ${sizeClasses()}`}
      style={{ backgroundColor: color }}
      title={color}
    ></div>
  );
};

export { ColorSwatch };