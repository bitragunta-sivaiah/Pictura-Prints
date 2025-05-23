import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/apiClient';
import { toast } from 'react-hot-toast';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({ page, limit, read, type }, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/api/notifications', {
                params: { page, limit, read, type },
            });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/api/notifications/unread-count');
            return data.unreadCount;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch unread count';
            console.error('Error fetching unread count:', message);
            return rejectWithValue(message);
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await API.put(`/api/notifications/${notificationId}/read`);
            toast.success(data.message || 'Notification marked as read!');
            dispatch(fetchUnreadCount());
            return data.notification;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await API.put('/api/notifications/mark-all-read');
            toast.success(data.message || 'All notifications marked as read!');
            dispatch(fetchUnreadCount());
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to mark all notifications as read';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await API.delete(`/api/notifications/${notificationId}`);
            toast.success(data.message || 'Notification deleted!');
            dispatch(fetchUnreadCount());
            return notificationId;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete notification';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    status: 'idle',
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
    },
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        socketNotificationReceived: (state, action) => {
            const newNotification = action.payload;
            state.notifications.unshift(newNotification);
            if (!newNotification.read) {
                state.unreadCount += 1;
            }
            toast.success(`New Notification: ${newNotification.title}`, {
                duration: 5000,
                onClick: () => {
                    console.log('Toast clicked:', newNotification);
                },
            });
        },
        resetNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.status = 'idle';
            state.error = null;
            state.pagination = {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload.notifications;
                state.pagination = {
                    page: action.payload.page,
                    pages: action.payload.pages,
                    total: action.payload.total,
                    limit: action.payload.limit,
                };
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const updatedNotification = action.payload;
                const index = state.notifications.findIndex(
                    (n) => n._id === updatedNotification._id
                );
                if (index !== -1) {
                    state.notifications[index] = { ...state.notifications[index], read: true };
                }
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const deletedNotificationId = action.payload;
                state.notifications = state.notifications.filter(
                    (n) => n._id !== deletedNotificationId
                );
            });
    },
});

export const { socketNotificationReceived, resetNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;