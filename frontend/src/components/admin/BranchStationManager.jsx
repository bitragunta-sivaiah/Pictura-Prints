import React, { useState, useEffect } from 'react';
 import { useDispatch, useSelector } from 'react-redux';
 import {
  getAllBranchStations,
  deleteBranchStation,
  clearBranchStationDetails,
} from '../../store/adminBranchSlice';
 import { toast } from 'react-hot-toast';
 import { Trash2, PlusCircle, X } from 'lucide-react';
 import CreateBranchStation from './CreateBranchStation';  
 import UpdateBranchStation from './UpdateBranchStation'; // Import the update component
import { useNavigate } from 'react-router-dom';

 const BranchStationManager = () => {
  const dispatch = useDispatch();
  const branchStations = useSelector((state) => state.adminBranch.branchStations);
  const loading = useSelector((state) => state.adminBranch.loading);
  const error = useSelector((state) => state.adminBranch.error);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  useEffect(() => {
   dispatch(getAllBranchStations());
   return () => {
    dispatch(clearBranchStationDetails());
   };
  }, [dispatch]);

  const handleDeleteBranch = async (id) => {
   if (window.confirm('Are you sure you want to delete this branch station?')) {
    await dispatch(deleteBranchStation(id));
   }
  };

  const openCreateModal = () => {
   setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
   setIsCreateModalOpen(false);
  };

  const openUpdateModal = (id) => {
   setSelectedBranchId(id);
   setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
   setSelectedBranchId(null);
   setIsUpdateModalOpen(false);
  };

  if (loading) {
   return <div className="flex justify-center items-center h-screen">Loading branch stations...</div>;
  }

  if (error) {
   return (
    <div className="flex justify-center items-center h-screen text-red-500">
     Error loading branch stations: {error || 'An unexpected error occurred.'}
    </div>
   );
  }

  return (
   <div className="container mx-auto p-6">
    <h1 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center justify-between">
     Branch Station Management
     <button
      onClick={openCreateModal}
      className="bg-green-500 hover:bg-green-700 text-sm md:text-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
     >
      <PlusCircle className="inline-block mr-2" size={18} /> Create New Branch
     </button>
    </h1>

    {branchStations && branchStations.length > 0 ? (
     <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
       <thead className="bg-gray-50">
        <tr>
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
         </th>
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Address
         </th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          City
         </th>
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          State
         </th>
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Postal Code
         </th>
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contact
         </th>
         <th scope="col" className="relative px-6 py-3">
          <span className="sr-only">Edit/Delete</span>
         </th>
        </tr>
       </thead>
       <tbody className="bg-white divide-y divide-gray-200">
        {branchStations.map((branch) => (
         <tr key={branch._id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{branch.name}</td>
          <td className="px-6 py-4 text-sm text-gray-500">{branch.address}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.city}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.state}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.postalCode}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
           {branch.contactPerson} ({branch.contactPhone})
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
           <button
            onClick={() => openUpdateModal(branch._id)}
            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
           >
            Edit
           </button>
           <button
            onClick={() => handleDeleteBranch(branch._id)}
            className="text-red-600 hover:text-red-900 focus:outline-none"
           >
            <Trash2 className="inline-block" size={16} />
           </button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    ) : (
     <p className="text-gray-600">No branch stations available.</p>
    )}

    {isCreateModalOpen && (
     <div className="fixed inset-0 bg-white bg-opacity-50 z-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <CreateBranchStation onClose={closeCreateModal} />
     </div>
    )}

    {isUpdateModalOpen && selectedBranchId && (
     <div className="fixed inset-0 bg-white z-50 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <UpdateBranchStation branchId={selectedBranchId} onClose={closeUpdateModal} />
     </div>
    )}
   </div>
  );
 };

 export default BranchStationManager;