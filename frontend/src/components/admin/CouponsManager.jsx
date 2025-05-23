import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    selectAllCoupons,
    selectCouponLoading,
    selectCouponError,
    clearCurrentCoupon,
} from '../../store/couponSlice';
import { Plus, Edit, Trash2, Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CouponManager = () => {
    const dispatch = useDispatch();
    const coupons = useSelector(selectAllCoupons);
    const loading = useSelector(selectCouponLoading);
    const error = useSelector(selectCouponError);

    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'fixed_amount',
        value: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        validFrom: '',
        validUntil: '',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchCoupons());
    }, [dispatch]);

    useEffect(() => {
        if (editingCoupon) {
            const formattedValidFrom = editingCoupon.validFrom ? new Date(editingCoupon.validFrom).toISOString().split('T')[0] : '';
            const formattedValidUntil = editingCoupon.validUntil ? new Date(editingCoupon.validUntil).toISOString().split('T')[0] : '';

            setFormData({
                ...editingCoupon,
                value: editingCoupon.value || 0, // Ensure value is not undefined
                minOrderValue: editingCoupon.minOrderValue || 0, // Ensure minOrderValue is not undefined
                maxDiscountAmount: editingCoupon.maxDiscountAmount || 0, // Ensure maxDiscountAmount is not undefined
                usageLimit: editingCoupon.usageLimit || 0, // Ensure usageLimit is not undefined
                validFrom: formattedValidFrom,
                validUntil: formattedValidUntil,
            });
            setShowForm(true);
        } else {
            setFormData({
                code: '',
                description: '',
                type: 'fixed_amount',
                value: 0,
                minOrderValue: 0,
                maxDiscountAmount: 0,
                usageLimit: 0,
                validFrom: '',
                validUntil: '',
                isActive: true,
            });
        }
    }, [editingCoupon]);

    const handleCreateClick = () => {
        setEditingCoupon(null);
        setShowForm(true);
    };

    const handleEditClick = (coupon) => {
        setEditingCoupon(coupon);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            dispatch(deleteCoupon(id));
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('Coupon code is required.');
            return;
        }
        if (parseFloat(formData.value) <= 0 && formData.type !== 'free_shipping') {
            toast.error('Coupon value must be greater than 0 for fixed amount or percentage coupons.');
            return;
        }
        if (formData.type === 'percentage' && (parseFloat(formData.value) > 100 || parseFloat(formData.value) < 0)) {
            toast.error('Percentage value must be between 0 and 100.');
            return;
        }
        if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) > new Date(formData.validUntil)) {
            toast.error('Valid From date cannot be after Valid Until date.');
            return;
        }

        const dataToSubmit = {
            ...formData,
            value: parseFloat(formData.value),
            minOrderValue: parseFloat(formData.minOrderValue),
            // Only include maxDiscountAmount if type is percentage and it has a value
            maxDiscountAmount: formData.type === 'percentage' && formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
            usageLimit: parseInt(formData.usageLimit) || undefined,
        };

        if (editingCoupon) {
            dispatch(updateCoupon({ id: editingCoupon._id, couponData: dataToSubmit }));
        } else {
            dispatch(createCoupon(dataToSubmit));
        }
        setShowForm(false);
        setEditingCoupon(null);
        dispatch(clearCurrentCoupon());
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingCoupon(null);
        dispatch(clearCurrentCoupon());
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Coupon Manager</h1>

            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-grow max-w-md">
                    <input
                        type="text"
                        placeholder="Search coupons by code or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
                {!showForm && (
                    <button
                        onClick={handleCreateClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300 ease-in-out"
                    >
                        <Plus size={20} className="mr-2" /> Create New Coupon
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex justify-between items-center">
                        {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                        <button onClick={handleFormCancel} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Coupon Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                rows="3"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Coupon Type <span className="text-red-500">*</span></label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="fixed_amount">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>

                        {formData.type !== 'free_shipping' && (
                            <div>
                                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                                    Value {formData.type === 'percentage' ? '(%)' : '($)'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="value"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleFormChange}
                                    min={0}
                                    step={formData.type === 'percentage' ? 0.01 : 0.01}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {formData.type === 'percentage' && (
                            <div>
                                <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700">Max Discount Amount ($)</label>
                                <input
                                    type="number"
                                    id="maxDiscountAmount"
                                    name="maxDiscountAmount"
                                    value={formData.maxDiscountAmount}
                                    onChange={handleFormChange}
                                    min={0}
                                    step="0.01"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700">Minimum Order Value ($)</label>
                            <input
                                type="number"
                                id="minOrderValue"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleFormChange}
                                min={0}
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">Usage Limit (0 for unlimited)</label>
                            <input
                                type="number"
                                id="usageLimit"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleFormChange}
                                min={0}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">Valid From</label>
                            <input
                                type="date"
                                id="validFrom"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">Valid Until</label>
                            <input
                                type="date"
                                id="validUntil"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleFormChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleFormCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-4 text-blue-600">
                    <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></span>
                    Loading coupons...
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center mb-4" role="alert">
                    <AlertCircle className="mr-2" size={20} />
                    <span>Error: {error}</span>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {filteredCoupons.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">No coupons found.</p>
                    ) : (
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm font-semibold">
                                    <th className="px-5 py-3 text-left">Code</th>
                                    <th className="px-5 py-3 text-left">Type</th>
                                    <th className="px-5 py-3 text-left">Value</th>
                                    <th className="px-5 py-3 text-left">Min Order</th>
                                    <th className="px-5 py-3 text-left">Usage Limit</th>
                                    <th className="px-5 py-3 text-left">Usage Count</th>
                                    <th className="px-5 py-3 text-left">Valid From</th>
                                    <th className="px-5 py-3 text-left">Valid Until</th>
                                    <th className="px-5 py-3 text-center">Active</th>
                                    <th className="px-5 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((coupon) => (
                                    <tr key={coupon._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-5 py-4 text-sm text-gray-900">{coupon.code}</td>
                                        <td className="px-5 py-4 text-sm text-gray-900 capitalize">{coupon.type?.replace('_', ' ')}</td>
                                        <td className="px-5 py-4 text-sm text-gray-900">
                                            {coupon.type === 'percentage' ?
                                                `${(coupon.value || 0).toFixed(2)}%` :
                                                `$${(coupon.value || 0).toFixed(2)}`
                                            }
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-900">${(coupon.minOrderValue || 0).toFixed(2)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-900">
                                            {coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-900">{coupon.usageCount || 0}</td>
                                        <td className="px-5 py-4 text-sm text-gray-900">
                                            {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-900">
                                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 text-center text-sm">
                                            {coupon.isActive ? (
                                                <CheckCircle className="text-green-500 mx-auto" size={20} />
                                            ) : (
                                                <X className="text-red-500 mx-auto" size={20} />
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(coupon)}
                                                    className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(coupon._id)}
                                                    className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default CouponManager;