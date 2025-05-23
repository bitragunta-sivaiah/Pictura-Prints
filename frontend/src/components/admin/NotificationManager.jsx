import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    fetchNotificationById,
    createNotification,
    updateNotification,
    resetNotification,
    deleteNotification,
} from '../../store/notificationSlice';
import { getAllUsers } from '../../store/userSlice';
import { getAllOrders } from '../../store/orderSlice';
import {
    Bell,
    CheckCircle,
    XCircle,
    Trash2,
    Edit,
    Plus,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

dayjs.extend(relativeTime);

const NotificationManager = () => {
    const dispatch = useDispatch();
    const { notifications, notification, loading, error, total } = useSelector((state) => state.notifications);
    const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.auth);
    const { orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.order);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState('');
    const [userId, setUserId] = useState('');
    const [type, setType] = useState('');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');
    const [customizationId, setCustomizationId] = useState('');
    const [status, setStatus] = useState('');
    const [read, setRead] = useState(false);
    const [details, setDetails] = useState('');
    const [relatedModel, setRelatedModel] = useState('');
    const [event, setEvent] = useState('');

    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getAllOrders());
    }, [dispatch]);

    const fetchNotificationsData = useCallback(() => {
        dispatch(
            fetchNotifications({
                page,
                limit,
                search: debouncedSearchTerm,
                userIds: selectedUsers.map(u => u.value),
                orderIds: selectedOrders.map(o => o.value),
            })
        );
    }, [dispatch, page, limit, debouncedSearchTerm, selectedUsers, selectedOrders]);

    useEffect(() => {
        fetchNotificationsData();
    }, [fetchNotificationsData]);

    useEffect(() => {
        if (selectedNotificationId) {
            dispatch(fetchNotificationById(selectedNotificationId));
        } else {
            dispatch(resetNotification());
        }
    }, [dispatch, selectedNotificationId]);

    useEffect(() => {
        if (notification) {
            setUserId(notification.userId?._id || notification.userId || '');
            setType(notification.type || '');
            setMessage(notification.message || '');
            setOrderId(notification.orderId?._id || notification.orderId || '');
            setCustomizationId(notification.customizationId?._id || notification.customizationId || '');
            setStatus(notification.status || '');
            setRead(notification.read || false);
            setDetails(JSON.stringify(notification.details) || '');
            setRelatedModel(notification.relatedModel || '');
            setEvent(notification.event || '');
            setIsUpdating(true);
            setIsCreating(false);
        } else {
            setIsUpdating(false);
        }
    }, [notification]);

    const handleCreateNotification = () => {
        const newNotification = {
            userId,
            type,
            message,
            orderId: orderId || undefined,
            customizationId: customizationId || undefined,
            status: status || undefined,
            read,
            details: details ? JSON.parse(details) : undefined,
            relatedModel: relatedModel || undefined,
            event: event || undefined,
        };
        dispatch(createNotification(newNotification));
        resetForm();
        setIsCreating(false);
    };

    const handleUpdateNotification = () => {
        const updatedNotificationData = {
            userId,
            type,
            message,
            orderId: orderId || undefined,
            customizationId: customizationId || undefined,
            status: status || undefined,
            read,
            details: details ? JSON.parse(details) : undefined,
            relatedModel: relatedModel || undefined,
            event: event || undefined,
        };
        dispatch(updateNotification({ id: selectedNotificationId, notificationData: updatedNotificationData }));
        resetForm();
        setIsUpdating(false);
        setSelectedNotificationId('');
    };

    const handleDeleteNotification = (id) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            dispatch(deleteNotification(id));
        }
    };

    const resetForm = () => {
        setUserId('');
        setType('');
        setMessage('');
        setOrderId('');
        setCustomizationId('');
        setStatus('');
        setRead(false);
        setDetails('');
        setRelatedModel('');
        setEvent('');
    };

    const userOptions = users?.map(user => ({
  value: user._id,
  label: ` ${user.username} (${user.email}) `
})) || [];
    const orderOptions = orders?.map(order => ({ value: order._id, label: `#${order.orderNumber} - ${order.status}` })) || [];

    const handleUserFilterChange = (selectedOptions) => {
        setSelectedUsers(selectedOptions || []);
        setPage(1);
    };

    const handleOrderFilterChange = (selectedOptions) => {
        setSelectedOrders(selectedOptions || []);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="  min-h-screen p-2">
            <div className="container mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notification Management</h2>

                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setIsUpdating(false);
                            resetForm();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <Plus className="inline-block mr-2" size={16} />
                        Add New
                    </button>

                    <div className="flex items-center flex-grow">
                        <label htmlFor="search" className="mr-2 text-sm text-gray-700">
                            Search:
                        </label>
                        <input
                            type="text"
                            id="search"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                            placeholder="Search message, type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
                        <label htmlFor="userFilter" className="mr-2 text-sm text-gray-700">
                            Filter by User:
                        </label>
                        <div className="w-48">
                            <Select
                                id="userFilter"
                                isMulti
                                options={userOptions}
                                value={selectedUsers}
                                onChange={handleUserFilterChange}
                                placeholder="Select Users"
                                isClearable
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <label htmlFor="orderFilter" className="mr-2 text-sm text-gray-700">
                            Filter by Order:
                        </label>
                        <div className="w-48">
                            <Select
                                id="orderFilter"
                                isMulti
                                options={orderOptions}
                                value={selectedOrders}
                                onChange={handleOrderFilterChange}
                                placeholder="Select Orders"
                                isClearable
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {(isCreating || isUpdating) && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {isCreating ? 'Create New Notification' : 'Update Notification'}
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="userId" className="block text-gray-700 text-sm font-bold mb-2">
                                    User:
                                </label>
                                {usersLoading ? (
                                    <div className="text-gray-500 flex items-center">
                                        <Loader2 className="inline-block mr-2 animate-spin" size={16} />
                                        Loading users...
                                    </div>
                                ) : usersError ? (
                                    <div className="text-red-500 flex items-center">
                                        <AlertCircle className="inline-block mr-2" size={16} />
                                        Error loading users: {usersError}
                                    </div>
                                ) : (
                                    <Select
                                        id="userId"
                                        value={userOptions.find((option) => option.value === userId)}
                                        onChange={(selectedOption) => setUserId(selectedOption?.value || '')}
                                        options={userOptions}
                                        isClearable
                                        placeholder="Select User"
                                        className="  focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm   rounded-md   "
                                    />
                                )}
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
                                    Type:
                                </label>
                                <input
                                    type="text"
                                    id="type"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
                                    Message:
                                </label>
                                <textarea
                                    id="message"
                                    rows="3"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="orderId" className="block text-gray-700 text-sm font-bold mb-2">
                                    Order (Optional):
                                </label>
                                {ordersLoading ? (
                                    <div className="text-gray-500 flex items-center">
                                        <Loader2 className="inline-block mr-2 animate-spin" size={16} />
                                        Loading orders...
                                    </div>
                                ) : ordersError ? (
                                    <div className="text-red-500 flex items-center">
                                        <AlertCircle className="inline-block mr-2" size={16} />
                                        Error loading orders: {ordersError}
                                    </div>
                                ) : (
                                    <Select
                                        id="orderId"
                                        value={orderOptions.find((option) => option.value === orderId)}
                                        onChange={(selectedOption) => setOrderId(selectedOption?.value || '')}
                                        options={orderOptions}
                                        isClearable
                                        placeholder="Select Order"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    />
                                )}
                            </div>
                            <div>
                                <label htmlFor="customizationId" className="block text-gray-700 text-sm font-bold mb-2">
                                    Customization ID (Optional):
                                </label>
                                <input
                                    type="text"
                                    id="customizationId"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    value={customizationId}
                                    onChange={(e) => setCustomizationId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                                    Status (Optional):
                                </label>
                                <input
                                    type="text"
                                    id="status"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="read" className="block text-gray-700 text-sm font-bold mb-2">
                                    Read:
                                </label>
                                <input
                                    type="checkbox"
                                    id="read"
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    checked={read}
                                    onChange={(e) => setRead(e.target.checked)}
                                />
                            </div>
                            <div>
                                <label htmlFor="details" className="block text-gray-700 text-sm font-bold mb-2">
                                    Details (JSON):
                                </label>
                                <textarea
                                    id="details"
                                    rows="2"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder='e.g., {"key": "value"}'
                                />
                            </div>
                            <div>
                                <label htmlFor="relatedModel" className="block text-gray-700 text-sm font-bold mb-2">
                                    Related Model (Optional):
                                </label>
                                <input
                                    type="text"
                                    id="relatedModel"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    value={relatedModel}
                                    onChange={(e) => setRelatedModel(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="event" className="block text-gray-700 text-sm font-bold mb-2">
                                    Event (Optional):
                                </label>
                                <input
                                    type="text"
                                    id="event"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 h-[45px]"
                                    value={event}
                                    onChange={(e) => setEvent(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsUpdating(false);
                                        resetForm();
                                        setSelectedNotificationId('');
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                {isCreating && (
                                    <button
                                        type="button"
                                        onClick={handleCreateNotification}
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="inline-block mr-2 animate-spin" size={16} />
                                        ) : (
                                            'Create'
                                        )}
                                    </button>
                                )}
                                {isUpdating && (
                                    <button
                                        type="button"
                                        onClick={handleUpdateNotification}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="inline-block mr-2 animate-spin" />
                                        ) : (
                                            'Update'
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
                    {loading && (
                        <div className="text-gray-500 flex items-center">
                            <Loader2 className="inline-block mr-2 animate-spin" size={16} />
                            Loading notifications...
                        </div>
                    )}
                    {error && (
                        <div className="text-red-500 flex items-center">
                            <AlertCircle className="inline-block mr-2" size={16} />
                            Error: {error}
                        </div>
                    )}
                </div>

                {!loading && !error && notifications && notifications.length > 0 ? (
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full leading-normal">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Read
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-4 py-3 border-b-2 border-gray-200 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {notifications.map((n) => (
                                    <tr key={n._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{n._id}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{n.userId?.name || n.userId}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{n.type}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{n.message}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{n.orderId?.orderNumber || n.orderId || '-'}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-center text-sm">
                                            {n.read ? (
                                                <CheckCircle className="text-green-500 mx-auto" size={18} />
                                            ) : (
                                                <XCircle className="text-red-500 mx-auto" size={18} />
                                            )}
                                        </td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-800">{dayjs(n.createdAt).fromNow()}</td>
                                        <td className="px-4 py-4 border-b border-gray-200 text-right text-sm">
                                            <button
                                                onClick={() => setSelectedNotificationId(n._id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md text-xs mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <Edit className="inline-block mr-1" size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNotification(n._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="inline-block mr-1" size={14} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {total > limit && (
                            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-200 sm:px-6">
                                <div className="flex-1 text-sm text-gray-700">
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                                </div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02-.03L7.72 10 12.79 14.77a.75.75 0 01-1.06 1.06l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 011.08.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {[...Array(Math.ceil(total / limit))].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => handlePageChange(index + 1)}
                                            aria-current={page === index + 1 ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === index + 1
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === Math.ceil(total / limit)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02.03L12.28 10 7.21 5.23a.75.75 0 011.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 01-1.08-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                ) : (
                    !loading && !error && <div className="text-gray-600 py-4">No notifications found.</div>
                )}
            </div>
        </div>
    );
};

export default NotificationManager;