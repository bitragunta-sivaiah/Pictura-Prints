import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMoneyBillAlt, FaShoppingCart, FaHome, FaUserGraduate } from 'react-icons/fa';
import Confetti from 'react-confetti';
import { debounce } from 'lodash';
import { motion, useAnimation } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { capturePaypalPayment } from '../store/orderSlice'; // Import the capturePaypalPayment thunk
import { toast } from 'react-hot-toast';
import { Package } from 'lucide-react';

function SuccessOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [paymentId, setPaymentId] = useState('');
  const [token, setToken] = useState('');
  const [payerId, setPayerId] = useState('');
  const [orderId, setOrderId] = useState(''); // Add state for orderId
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const checkmarkAnimation = useAnimation();
  const circleScaleAnimation = useAnimation();
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const payment = searchParams.get('paymentId') || '';
    const tk = searchParams.get('token') || '';
    const pId = searchParams.get('PayerID') || '';
    const oId = searchParams.get('orderId') || ''; // Extract orderId
    setPaymentId(payment);
    setToken(tk);
    setPayerId(pId);
    setOrderId(oId); // Set the orderId state

    // Dispatch the capturePaypalPayment thunk with orderId
    if (payment && pId && oId) {
      dispatch(capturePaypalPayment({ paymentId: payment, PayerID: pId, orderId: oId }));
    } else {
      toast.error('Payment details or Order ID are missing. Please try again.');
      navigate('/checkout'); // Redirect to checkout if details are missing
    }

    // Trigger checkmark animation after a slight delay
    const animationTimeout = setTimeout(async () => {
      await checkmarkAnimation.start({ pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } });
      setIsConfettiActive(true); // Start confetti after the checkmark animation
    }, 500);

    return () => clearTimeout(animationTimeout);
  }, [location.search, checkmarkAnimation, dispatch, navigate]);

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, 200);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loopScale = async () => {
      await circleScaleAnimation.start({ scale: 1.05, transition: { duration: 1, ease: 'easeInOut' } });
      await circleScaleAnimation.start({ scale: 1, transition: { duration: 1, ease: 'easeInOut' } });
      loopScale(); // Loop indefinitely
    };

    loopScale(); // Start the looping scale animation
  }, [circleScaleAnimation]);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const headingVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.2 } },
  };

  const textVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 0.4 } },
  };

  const detailItemVariants = {
    initial: { opacity: 0, x: -5 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut', delay: 0.5 } },
  };

  const buttonVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 0.7 } },
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
  };

  const checkmarkCircleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 3, opacity: 1, transition: { duration: 0.3, ease: 'backOut' } },
    loop: { scale: [1, 3, 1], transition: { duration: 2, ease: 'easeInOut', repeat: Infinity } },
  };

  const checkmarkPathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {isConfettiActive && <Confetti width={windowSize.width} height={windowSize.height} gravity={0.1} recycle={false} />}
      <motion.div
        className="bg-white rounded-lg shadow-md p-8 w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl" // Responsive max-width
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex justify-center mb-6">
          <motion.svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" // Responsive icon size
            viewBox="0 0 48 48"
            initial="initial"
            animate="animate"
          >
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="rgba(34, 197, 94, 0.2)"
              variants={{ ...checkmarkCircleVariants, loop: {} }} // Apply initial and loop variants
              animate={circleScaleAnimation} // Control scale with circleScaleAnimation
            />
            <motion.path
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 26l8 8L34 16"
              variants={checkmarkPathVariants}
              animate={checkmarkAnimation} // Control path animation separately
            />
          </motion.svg>
        </div>

        <motion.h2 className="text-xl font-semibold text-center text-green-700 mb-3 sm:text-2xl md:text-3xl" variants={headingVariants}>
          Order Successful!
        </motion.h2>
        <motion.p className="text-gray-600 text-center mb-4 sm:text-lg" variants={textVariants}>
          Your payment has been successfully processed. Thank you for your purchase.
        </motion.p>

        <div className="mb-4">
          <motion.div className="bg-gray-100 rounded-md py-3 px-4 sm:py-2 sm:px-3" variants={textVariants}>
            <p className="text-gray-700 font-medium text-sm mb-2 sm:mb-1">Payment Details:</p>
            <motion.p className="text-gray-600 text-sm flex items-center space-x-2 mb-2 sm:mb-1" variants={detailItemVariants}>
              <FaMoneyBillAlt className="text-gray-500" />
              <span>Payment ID:</span>
              <span className="font-mono">{paymentId}</span>
            </motion.p>
            <motion.p className="text-gray-600 text-sm flex items-center space-x-2 mb-2 sm:mb-1" variants={detailItemVariants} transition={{ delay: 0.1 }}>
              <FaShoppingCart className="text-gray-500" />
              <span>Token:</span>
              <span className="font-mono">{token}</span>
            </motion.p>
            <motion.p className="text-gray-600 text-sm flex items-center space-x-2 mb-2 sm:mb-1" variants={detailItemVariants} transition={{ delay: 0.2 }}>
              <FaUserGraduate className="text-gray-500" />
              <span>Payer ID:</span>
              <span className="font-mono">{payerId}</span>
            </motion.p>
            <motion.p className="text-gray-600 text-sm flex items-center space-x-2" variants={detailItemVariants} transition={{ delay: 0.3 }}>
              <FaShoppingCart className="text-gray-500" />
              <span>Order ID:</span>
              <span className="font-mono">{orderId}</span> {/* Display the order ID */}
            </motion.p>
          </motion.div>
        </div>

        <motion.div className="flex justify-center mt-6 gap-5" variants={buttonVariants}>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-5 rounded-md flex items-center space-x-2 shadow-sm transition-colors duration-300 sm:py-2 sm:px-4" // Responsive button padding
            whileHover="hover"
            whileTap="tap"
          >
            <FaHome className="sm:text-lg" /> {/* Responsive icon size */}
            <span>Go to Home</span>
          </button>
          <button
            onClick={() => navigate(`/sucessorder/${orderId}`)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-5 rounded-md flex items-center space-x-2 shadow-sm transition-colors duration-300 sm:py-2 sm:px-4" // Responsive button padding
            whileHover="hover"
            whileTap="tap"
          >
            <Package className="sm:text-lg" /> {/* Responsive icon size */}
            <span>Go to Order Details</span>
          </button>
        </motion.div>
      </motion.div>
      {isConfettiActive && <Confetti width={windowSize.width} height={windowSize.height} gravity={0.1} recycle={false} />}
    </div>
  );
}

export default SuccessOrder;