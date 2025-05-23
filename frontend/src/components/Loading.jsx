import React, { useState, useEffect } from 'react';
import { motion, useCycle } from 'framer-motion';
import { Cloud, Sun, Wifi, Camera, Heart } from 'lucide-react'; // Example icons

const LoadingPage = ({ loadingName = 'Loading...' }) => {
  const [loadingText, setLoadingText] = useState(loadingName);
  const [iconIndex, setIconIndex] = useState(0);
  const [animate, cycle] = useCycle(0, 1);

  const icons = [<Cloud />, <Sun />, <Wifi />, <Camera />, <Heart />];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 500); // Change icon every 0.5 seconds

    return () => clearInterval(interval);
  }, [icons.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prevText) => {
        if (prevText.endsWith('...')) {
          return loadingName;
        } else {
          return prevText + '.';
        }
      });
    }, 300); // Add a dot every 0.3 seconds

    return () => clearInterval(interval);
  }, [loadingName]);

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2, // Stagger the animation of each icon
      },
    },
  };

  const iconVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <motion.div
        className="relative w-24 h-24 flex items-center justify-center"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {icons.map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-indigo-500 text-3xl"
            variants={iconVariants}
            style={{ opacity: index === iconIndex ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {icon}
          </motion.div>
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-lg text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {loadingText}
      </motion.p>
    </div>
  );
};

export default LoadingPage;