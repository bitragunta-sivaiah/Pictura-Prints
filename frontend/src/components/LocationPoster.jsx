import React, { useState, useEffect, useMemo } from 'react';
import { X, Expand } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchBanners, // Import the main fetch banners thunk
  selectAllBanners, // Selector for all banners
  selectBannersLoading, // Selector for loading state
  selectBannersError, // Selector for error state
} from '../store/bannerSlice'; // Adjust the path as needed

const BannerPoster = ({ position }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  const [postVisible, setPostVisible] = useState(false); // Controls visibility of the poster
  const dispatch = useDispatch();
  const allBanners = useSelector(selectAllBanners);
  const loading = useSelector(selectBannersLoading);
  const error = useSelector(selectBannersError);
  // Assuming 'user' is part of an 'auth' slice in your Redux store
  const { user } = useSelector((state) => state.auth);

  // Effect to decide initial visibility of the poster
  useEffect(() => {
    // Show the poster if the user is logged in
    if (user) {
      setPostVisible(true);
    } else {
      // Keep it hidden if the user is not logged in
      setPostVisible(false);
    }
  }, [user]); // Re-run when user state changes

  // Fetch banners and auto-hide after a duration
  useEffect(() => {
    let hideTimeout; // Declare timeout variable

    if (postVisible && user && allBanners.length === 0 && !loading && !error) {
      dispatch(fetchBanners());
    }

    // Always set the timeout if the poster is visible and user is logged in
    if (postVisible && user) {
      hideTimeout = setTimeout(() => {
        setPostVisible(false);
      }, 7000); // Hide after 7 seconds (7000 milliseconds)
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout); // Cleanup the timeout
      }
    };
  }, [dispatch, postVisible, user, allBanners.length, loading, error]); // Add dependencies if needed

  // Memoized filter for relevant advertisement banners
  const locationSpecificAds = useMemo(() => {
    const now = new Date();
    return allBanners
      ? allBanners.filter((banner) => {
          const isCorrectPosition = banner.position === position;
          const isAdvertisement = banner.position.includes('advertisement');
          const isActive = banner.isActive;

          // Check if banner is within its active date range
          const startDate = banner.startDate ? new Date(banner.startDate) : null;
          const endDate = banner.endDate ? new Date(banner.endDate) : null;
          const isDateValid =
            (!startDate || now >= startDate) && (!endDate || now <= endDate);

          // Ensure it's an advertisement banner and has an imageUrl
          const hasImageUrl = isAdvertisement && banner.imageUrl;

          return isCorrectPosition && isActive && isDateValid && hasImageUrl;
        })
      : [];
  }, [allBanners, position]);

  const handleHideAd = () => {
    setPostVisible(false);
  };

  const handleExpandImage = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  // Render loading state
  if (loading === 'pending') {
    return <div className="py-4 text-center text-gray-600">Loading Posters...</div>;
  }

  // Render error state
  if (error) {
    return <div className="py-4 text-center text-red-500">Error loading posters: {error}</div>;
  }

  // Determine the background color from the first ad in the array, or default to gray
  const posterBackgroundColor = locationSpecificAds.length > 0
    ? locationSpecificAds[0].postBg || 'gray' // Use postBg if available, otherwise default to 'gray'
    : 'gray'; // Default if no ads are present

  // Only render the poster container if `postVisible` is true and there are ads to display
  return (
    <>
      {postVisible && user && locationSpecificAds.length > 0 && (
        <div
          className="fixed w-[200px] h-[300px] z-50 md:h-[500px] md:w-[300px] rounded-2xl overflow-hidden p-1.5 right-3 bottom-5 shadow-lg"
          style={{ backgroundColor: posterBackgroundColor }}
        >
          {locationSpecificAds.map((ad) => (
            <div
              key={ad._id}
              className="relative w-full h-full rounded-2xl overflow-hidden"
            >
              {/* Link to the ad's navigation URL */}
              {ad.navigateLink ? (
                <Link to={ad.navigateLink} target="_blank" rel="noopener noreferrer">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || 'Advertisement'}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </Link>
              ) : (
                <img
                  src={ad.imageUrl}
                  alt={ad.title || 'Advertisement'}
                  className="w-full h-full object-cover cursor-pointer"
                />
              )}

              {/* Close Button */}
              <button
                onClick={handleHideAd}
          style={{ backgroundColor: posterBackgroundColor }}

                className="absolute top-2 right-2  bg-opacity-70   rounded-full w-7 h-7 flex items-center justify-center text-xs focus:outline-none hover:bg-opacity-90 transition-opacity"
                title="Hide Poster"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Expand Button */}
              <button
                onClick={() => handleExpandImage(ad.imageUrl)}
          style={{ backgroundColor: posterBackgroundColor }}

                className="absolute bottom-2 right-2   bg-opacity-70   rounded-full w-7 h-7 flex items-center justify-center text-xs focus:outline-none hover:bg-opacity-90 transition-opacity"
                title="Expand Image"
              >
                <Expand className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] bg-white bg-opacity-70 flex items-center justify-center p-4"
          onClick={handleCloseExpandedImage} // Close on backdrop click
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={expandedImage}
              alt="Expanded Ad"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={handleCloseExpandedImage}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg focus:outline-none hover:bg-opacity-90 transition-opacity"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BannerPoster;