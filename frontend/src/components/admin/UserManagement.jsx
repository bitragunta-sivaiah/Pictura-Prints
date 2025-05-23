import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers, updateUserRole, deleteUser, clearError } from '../../store/userSlice'; // Adjust path as needed
import { UserRound, Trash2, ShieldCheck } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.auth);
  const [selectedRoles, setSelectedRoles] = useState({});

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'branchManager', label: 'BranchManager' },
    { value: 'deliveryPartner', label: 'DeliveryPartner' },
    { value: 'admin', label: 'Admin' },
  ];

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRoleChange = (selectedOption, userId) => {
    setSelectedRoles({ ...selectedRoles, [userId]: selectedOption });
  };

  const handleUpdateRole = (userId) => {
    const selectedRole = selectedRoles[userId]?.value;
    if (selectedRole) {
      dispatch(updateUserRole({ id: userId, role: selectedRole }));
      setSelectedRoles({ ...selectedRoles, [userId]: null });
    } else {
      toast.warn('Please select a role to update.');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Increase z-index
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <UserRound className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-gray-900 whitespace-no-wrap">{user.username}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <ShieldCheck className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="w-48">
                        <Select
                          value={selectedRoles[user._id] || roleOptions.find(option => option.value === user.role)}
                          onChange={(selectedOption) => handleRoleChange(selectedOption, user._id)}
                          options={roleOptions}
                          isClearable={false}
                          placeholder="Select Role"
                          className="text-sm"
                          styles={customStyles}
                          menuPortalTarget={document.body}
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateRole(user._id)}
                        className="ml-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-xs"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <p className="text-gray-500 mt-4">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;