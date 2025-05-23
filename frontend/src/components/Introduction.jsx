import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import mockupVideo1 from '../assets/design-mobile.mp4';
import mockupVideo2 from '../assets/earn-mobile.mp4';
import mockupVideo3 from '../assets/newbies-hero-vertical-compact.mp4';

const IntroductionPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const totalSteps = 3;

  const stepDetails = [
    {
      id: 1,
      title: 'Select your product',
      description: 'Choose from over 1000 top quality products including brands you know and love.',
      // Removed video for now, will handle image upload
    },
    {
      id: 2,
      title: 'Add your design',
      description: 'Designing your products is easy and fun!',
      // Removed video for now
    },
    {
      id: 3,
      title: 'Start selling',
      description: 'You set your profit margin, we take care of production and delivery.',
      // Removed video for now
    },
  ];

  const currentStepInfo = stepDetails.find((step) => step.id === currentStep);

  // Removed useEffect related to video

  // Removed handleVideoEnded

  const handleNextStep = () => {
    setCurrentStep((prevStep) => (prevStep < totalSteps ? prevStep + 1 : 1));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-7xl w-full flex flex-col md:flex-row">
        {/* Left Section - Text Content */}
        <div className="p-8 md:w-1/2 flex flex-col justify-start">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Start with $0 investment</h1>
          <div className="relative">
            {stepDetails.map((step) => (
              <div key={step.id} className="py-4 relative flex items-start">
                <div
                  className={`mr-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white z-10 ${
                    step.id < currentStep ? 'bg-green-500' : step.id === currentStep ? 'bg-green-600' : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg
                      className="w-5 h-5 rounded-full"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 ${step.id === currentStep ? 'text-green-700' : ''}`}>{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {step.id < totalSteps && (
                  <div
                    className="absolute top-1/2 left-[12px] w-0.5 h-full bg-gray-200 -translate-y-1/2 z-0"
                    style={{ top: 'calc(50% + 12px)', bottom: 'calc(50% - 12px)' }}
                  />
                )}
                {step.id > 1 && step.id <= currentStep && (
                  <div
                    className="absolute top-0 left-[12px] h-full w-0.5 bg-green-500 z-0"
                    style={{ top: 'calc(-40px)', bottom: 'calc(50% + 12px)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Image Upload */}
        <div className="md:w-1/2 bg-gray-200 flex items-center justify-center p-8">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
          ) : (
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-48 w-full rounded-lg border-2 border-dashed border-gray-400 text-gray-600 hover:bg-gray-100">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              <span className="text-sm">Click to upload image</span>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadedImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>
      {/* Optional: Button to move to the next step */}
      {/* <button onClick={handleNextStep} className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md">
        Next Step
      </button> */}
    </div>
  );
};

export default IntroductionPage;