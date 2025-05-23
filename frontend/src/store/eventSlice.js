import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; 
import { toast } from 'react-hot-toast';

// --- Async Thunks ---

// Fetch all events
export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/api/events'); // Use the correct endpoint from your eventRouter
        return response.data;
    } catch (error) {
        toast.error("Failed to fetch events");
        return rejectWithValue(error.response?.data || 'Failed to fetch events');
    }
});

// Fetch a single event by ID
export const fetchEventById = createAsyncThunk('events/fetchEventById', async (id, { rejectWithValue }) => {
    try {
        const response = await API.get(`/api/events/${id}`); // Use the correct endpoint
        return response.data;
    } catch (error) {
        toast.error("Failed to fetch event");
        return rejectWithValue(error.response?.data || 'Failed to fetch event');
    }
});

// Create a new event
export const createEvent = createAsyncThunk('events/createEvent', async (eventData, { rejectWithValue }) => {
    try {
        const response = await API.post('/api/events', eventData); // Use the correct endpoint
        toast.success("Event created successfully!");
        return response.data;
    } catch (error) {
        toast.error("Failed to create event");
        return rejectWithValue(error.response?.data || 'Failed to create event');
    }
});

// Update an event by ID
export const updateEvent = createAsyncThunk('events/updateEvent', async ({ id, eventData }, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/events/${id}`, eventData); // Use the correct endpoint
        toast.success("Event updated successfully!");
        return response.data;
    } catch (error) {
        toast.error("Failed to update event");
        return rejectWithValue(error.response?.data || 'Failed to update event');
    }
});

// Delete an event by ID
export const deleteEvent = createAsyncThunk('events/deleteEvent', async (id, { rejectWithValue }) => {
    try {
        await API.delete(`/api/events/${id}`); // Use the correct endpoint
        toast.success("Event deleted successfully!");
        return id; // Return the ID for removal from state
    } catch (error) {
        toast.error("Failed to delete event");
        return rejectWithValue(error.response?.data || 'Failed to delete event');
    }
});

// Fetch events by type
export const fetchEventsByType = createAsyncThunk('events/fetchEventsByType', async (type, { rejectWithValue }) => {
    try {
        const response = await API.get(`/api/events/type/${type}`);
        return response.data;
    } catch (error) {
        toast.error(`Failed to fetch events of type ${type}`);
        return rejectWithValue(error.response?.data || `Failed to fetch events of type ${type}`);
    }
});

// Fetch active events
export const fetchActiveEvents = createAsyncThunk('events/fetchActiveEvents', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/api/events/active');
        return response.data;
    } catch (error) {
        toast.error("Failed to fetch active events");
        return rejectWithValue(error.response?.data || 'Failed to fetch active events');
    }
});

// Fetch events for a specific user
export const fetchEventsForUser = createAsyncThunk('events/fetchEventsForUser', async (userId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/api/events/user/${userId}`);
        return response.data;
    } catch (error) {
        toast.error("Failed to fetch events for user");
        return rejectWithValue(error.response?.data || 'Failed to fetch events for user');
    }
});

// --- Slice ---
const eventSlice = createSlice({
    name: 'events',
    initialState: {
        events: [],
        event: null,
        loading: false,
        error: null,
    },
    reducers: {
        // Reset single event
        resetEvent: (state) => {
            state.event = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch All Events ---
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Fetch Event by ID ---
            .addCase(fetchEventById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.loading = false;
                state.event = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Create Event ---
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.events.push(action.payload); // Add new event to the list
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Update Event ---
            .addCase(updateEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.events = state.events.map(event =>
                    event._id === action.payload._id ? action.payload : event
                );
                state.event = action.payload;
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Delete Event ---
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.events = state.events.filter(event => event._id !== action.payload); // Remove deleted event
                state.event = null;
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // --- Fetch Events By Type ---
            .addCase(fetchEventsByType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventsByType.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEventsByType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Fetch Active Events ---
            .addCase(fetchActiveEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchActiveEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Fetch Events for User ---
            .addCase(fetchEventsForUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventsForUser.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEventsForUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetEvent } = eventSlice.actions;
export default eventSlice.reducer;