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

const PostAds = ({ position }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  const [postVisible, setPostVisible] = useState(false);
  const dispatch = useDispatch();
  const allBanners = useSelector(selectAllBanners);
  const loading = useSelector(selectBannersLoading);
  const error = useSelector(selectBannersError);
  // Assuming 'user' is part of an 'auth' slice in your Redux store
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Show the poster if the user is logged in
    if (user) {
      setPostVisible(true);
    } else {
      setPostVisible(false);
    }
  }, [user]);

  useEffect(() => {
    if (postVisible && user && allBanners.length === 0 && !loading && !error) {
      dispatch(fetchBanners());
    }
  }, [dispatch, postVisible, user, allBanners.length, loading, error]);

  const locationSpecificAds = useMemo(() => {
    const now = new Date();
    return allBanners
      ? allBanners.filter((banner) => {
          const isCorrectPosition = banner.position === position;
          const isAdvertisement = banner.position.includes('advertisement');
          const isActive = banner.isActive;

          const startDate = banner.startDate ? new Date(banner.startDate) : null;
          const endDate = banner.endDate ? new Date(banner.endDate) : null;
          const isDateValid =
            (!startDate || now >= startDate) && (!endDate || now <= endDate);

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

  if (loading === 'pending') {
    return <div className="py-4 text-center text-gray-600">Loading Posters...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">Error loading posters: {error}</div>;
  }

  const posterBackgroundColor = locationSpecificAds.length > 0
    ? locationSpecificAds[0].postBg || '#f3f4f6'
    : '#f3f4f6';

  return (
    <>
      {postVisible && user && locationSpecificAds.length > 0 && (
        <div
          className="w-[95%] md:w-[90%] mx-auto rounded-xl  md:rounded-3xl overflow-hidden  "
          style={{ backgroundColor: posterBackgroundColor }}
        >
          {locationSpecificAds.map((ad) => (
            <div
              key={ad._id}
              className="relative w-full h-full rounded-2xl overflow-hidden"
            >
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

              {/* Close Button: Smaller on mobile, default size on medium screens and up */}
              <button
                onClick={handleHideAd}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs focus:outline-none hover:bg-opacity-90 transition-opacity"
                title="Hide Poster"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" /> {/* Icon size adjusted */}
              </button>
              {/* Expand Button: Smaller on mobile, default size on medium screens and up */}
              <button
                onClick={() => handleExpandImage(ad.imageUrl)}
                className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs focus:outline-none hover:bg-opacity-90 transition-opacity"
                title="Expand Image"
              >
                <Expand className="w-3 h-3 md:w-4 md:h-4" /> {/* Icon size adjusted */}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black bg-opacity-70 flex items-center justify-center p-4"
          onClick={handleCloseExpandedImage}
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

export default PostAds;