import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBanners } from '../store/bannerSlice'; 
import { motion } from 'framer-motion';

const Banner = ({ position }) => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banners);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [progress, setProgress] = useState(0);

  // Fetch banners when component mounts, but only if not already fetched
  useEffect(() => {
    if (banners.length === 0 && !loading && !error) {
      dispatch(fetchBanners());
    }
  }, [dispatch, banners.length, loading, error]);

  // Filter and sort banners based on position, active status, dates, and priority
  const filteredAndSortedBanners = useMemo(() => {
    const now = new Date();
    return banners
      .filter((banner) => {
        const isCorrectPosition = banner.position === position;
        const isActive = banner.isActive;

        // Check if banner is within start and end dates
        const startDate = banner.startDate ? new Date(banner.startDate) : null;
        const endDate = banner.endDate ? new Date(banner.endDate) : null;
        const isDateValid =
          (!startDate || now >= startDate) && (!endDate || now <= endDate);

        // Determine image availability based on banner type
        const isAdvertisement = banner.position.includes('advertisement');
        const hasCorrectImage = isAdvertisement
          ? banner.imageUrl // Advertisements use imageUrl
          : (isMobile ? banner.mobileImage?.[0] : banner.desktopImage?.[0]); // Regular banners use desktop/mobile image array

        return isCorrectPosition && isActive && isDateValid && hasCorrectImage;
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority descending
  }, [banners, isMobile, position]);

  // Reset current banner index if filtered banners change
  useEffect(() => {
    setCurrentBannerIndex(0);
    setProgress(0);
  }, [filteredAndSortedBanners]);

  // Handle automatic banner rotation and progress bar
  useEffect(() => {
    if (filteredAndSortedBanners.length > 0) {
      const intervalDuration = 5000; // 5 seconds
      const progressUpdateInterval = 100; // Update progress every 100ms
      const progressIncrement = (progressUpdateInterval / intervalDuration) * 100; // % increase per update

      const bannerInterval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % filteredAndSortedBanners.length);
        setProgress(0); // Reset progress for the new banner
      }, intervalDuration);

      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) {
            return prev + progressIncrement;
          }
          return 100;
        });
      }, progressUpdateInterval);

      return () => {
        clearInterval(bannerInterval);
        clearInterval(progressTimer);
      };
    }
  }, [filteredAndSortedBanners, currentBannerIndex]); // Depend on currentBannerIndex to reset progress for new banner

  // Handle window resize events for mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="py-4 text-center text-gray-600">Loading banners...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">Error loading banners: {error}</div>;
  }

  if (filteredAndSortedBanners.length === 0) {
    return <div />; // Render nothing if no banners are available for this position
  }

  const currentBanner = filteredAndSortedBanners[currentBannerIndex];
  const isAdvertisementBanner = currentBanner.position.includes('advertisement');
  const imageUrl = isAdvertisementBanner
    ? currentBanner.imageUrl
    : (isMobile ? currentBanner.mobileImage[0] : currentBanner.desktopImage[0]);

  // If navigateLink exists, wrap the image in an anchor tag
  const BannerContent = (
    <img
      src={imageUrl}
      alt={currentBanner.title}
      className="w-full h-full object-cover rounded-xl md:rounded-3xl"
    />
  );

  return (
    <div className="relative my-8 mx-5 rounded-lg overflow-hidden">
      <div className="relative overflow-hidden w-full h-auto">
        <motion.div
          key={currentBanner._id} // Use unique key for motion.div to re-mount and trigger animation
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }} // Smoother fade
          className="w-full h-full flex-shrink-0"
        >
          {currentBanner.navigateLink ? (
            <a href={currentBanner.navigateLink} target="_blank" rel="noopener noreferrer">
              {BannerContent}
            </a>
          ) : (
            BannerContent
          )}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
        {filteredAndSortedBanners.map((_, index) => (
          <div key={index} className="relative w-16 h-[4px] rounded-full bg-gray-200 overflow-hidden">
            {index === currentBannerIndex && (
              <motion.div
                className="absolute top-0 left-0 h-full bg-black rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.1 }} // Faster progress animation
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banner;