// src/components/StarRating.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ initialRating = 0, onRatingChange, size = 24 }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleMouseMove = (event, starIndex) => {
    const starRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - starRect.left;
    const isHalf = x < starRect.width / 2;
    setHoverRating(starIndex + (isHalf ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (rating) => {
    setCurrentRating(rating);
    onRatingChange(rating);
  };

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        const displayRating = hoverRating || currentRating;
        const fillPercentage =
          displayRating >= ratingValue
            ? 100
            : displayRating > i && displayRating < ratingValue
            ? (displayRating - i) * 100
            : 0;

        return (
          <div
            key={i}
            className="relative cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(hoverRating)}
          >
            <Star
              className="text-gray-300"
              size={size}
              strokeWidth={1.5}
              fill="none"
            />
            {fillPercentage > 0 && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className="text-yellow-500"
                  size={size}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;