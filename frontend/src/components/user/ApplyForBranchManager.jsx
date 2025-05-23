import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getAllBranchStations, 
} from '../../store/adminBranchSlice';  
import { applyForBranchManager,resetApplySuccess} from '../../store/branchStationSlice'
import {
  uploadImageToCloudinary,
  selectImageUrl,
  selectLoading as selectUploadLoading,
  selectError as selectUploadError,
  clearImageUrl,
 
} from '../../store/cloundarySlice';
import { toast, Toaster } from 'react-hot-toast';
import { FileUp, Loader2, X } from 'lucide-react';

const ApplyForBranchManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { branchStations, loading: loadingBranches, error: errorBranches, applySuccess } = useSelector(
    (state) => state.adminBranch // Using adminBranchSlice
  );
  const cloudinaryImageUrl = useSelector(selectImageUrl);
  const uploadLoading = useSelector(selectUploadLoading);
  const uploadError = useSelector(selectUploadError);

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState([
    'Resume/CV',
    'Cover Letter',
    'Identification Proof (e.g., Aadhaar, Passport)',
    'Experience Certificates (if any)',
    // Add more required documents as needed
  ]);

  useEffect(() => {
    dispatch(getAllBranchStations()); // Corrected dispatch action
    return () => {
      dispatch(clearImageUrl());
      // dispatch(resetApplySuccess()); // Reset success state on unmount if needed
      // dispatch(resetCloudinaryState()); // Reset cloudinary state if needed
    };
  }, [dispatch]);

  useEffect(() => {
    if (applySuccess) {
      toast.success('Application submitted successfully!');
      dispatch(resetApplySuccess()); // Reset success state
      navigate('/user/profile'); // Or wherever the user should go after applying
    }
  }, [applySuccess, navigate, dispatch]);

  const handleBranchChange = (e) => {
    setSelectedBranchId(e.target.value);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleDocumentChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      dispatch(uploadImageToCloudinary(file))
        .unwrap()
        .then((imageUrl) => {
          const newDocuments = [...documents];
          newDocuments[index] = imageUrl;
          setDocuments(newDocuments);
          setUploading(false);
          toast.success(`Document ${index + 1} uploaded!`);
        })
        .catch((error) => {
          console.error('Image upload failed:', error);
          toast.error(`Failed to upload document ${index + 1}.`);
          setUploading(false);
        });
    }
  };

  const handleRemoveDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments[index] = null; // Or you can remove the element using splice
    setDocuments(newDocuments);
  };

  const handleSubmit = () => {
    if (!selectedBranchId) {
      toast.error('Please select a branch to apply for.');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for your application.');
      return;
    }

    if (documents.length < requiredDocuments.length || documents.some((doc) => !doc)) {
      toast.error('Please upload all the required documents.');
      return;
    }

    dispatch(applyForBranchManager({ branchId: selectedBranchId, reason, documents })) // Corrected payload key to branchId
      .unwrap()
      .catch((error) => {
        toast.error(`Failed to submit application: ${error?.message || 'An error occurred'}`);
        console.error('Apply failed:', error);
      });
  };

  if (loadingBranches) {
    return <div className="container mx-auto p-8">Loading branches...</div>;
  }

  if (errorBranches) {
    return <div className="container mx-auto p-8 text-red-500">Error loading branches: {errorBranches}</div>;
  }

  return (
    <div className="container mx-auto p-8">
    <Toaster/>
      <h2 className="text-2xl font-semibold mb-4">Apply to Become Branch Manager</h2>

      <div className="mb-4">
        <label htmlFor="branch" className="block text-gray-700 text-sm font-bold mb-2">
          Select Branch
        </label>
        <select
          id="branch"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedBranchId}
          onChange={handleBranchChange}
        >
          <option value="">Select a Branch</option>
          {branchStations &&
            branchStations.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name} - {branch.city}, {branch.state}
              </option>
            ))}
        </select>
        {!selectedBranchId && <p className="text-yellow-600 text-xs italic mt-1">Please select a branch.</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">
          Reason for Application
        </label>
        <textarea
          id="reason"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="4"
          value={reason}
          onChange={handleReasonChange}
          placeholder="Explain why you are a good fit for this role."
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Required Documents</label>
        {requiredDocuments.map((doc, index) => (
          <div key={index} className="mb-3">
            <label htmlFor={`document-${index}`} className="block text-gray-600 text-xs font-semibold mb-1">
              {doc}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="file"
                id={`document-${index}`}
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) => handleDocumentChange(e, index)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {documents[index] ? (
                  <span className="text-green-500 text-sm">Uploaded</span>
                ) : uploading && !uploadError ? (
                  <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                ) : (
                  <FileUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            {documents[index] && (
              <div className="mt-2 flex items-center">
                <img src={documents[index]} alt={`Uploaded ${doc}`} className="h-12 w-12 object-cover rounded mr-2" />
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <X className="h-5 w-5" /> Remove
                </button>
              </div>
            )}
            {uploadError && <p className="text-red-500 text-xs italic">{uploadError}</p>}
          </div>
        ))}
        {documents.length < requiredDocuments.length || documents.some((doc) => !doc) ? (
          <p className="text-yellow-600 text-xs italic">Please upload all required documents.</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleSubmit}
          disabled={
            uploading ||
            !selectedBranchId ||
            documents.length < requiredDocuments.length ||
            documents.some((doc) => !doc)
          }
        >
          {uploading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" /> : 'Submit Application'}
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={() => navigate(-1)} // Go back to the previous page
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ApplyForBranchManager;