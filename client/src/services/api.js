import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// User API
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await api.put('/users/password', passwordData);
        return response.data;
    }
};

// Hairdresser API
export const hairdresserAPI = {
    search: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/hairdressers?${params}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/hairdressers/${id}`);
        return response.data;
    },

    createProfile: async (profileData) => {
        const response = await api.post('/hairdressers/profile', profileData);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/hairdressers/profile', profileData);
        return response.data;
    },

    addService: async (serviceData) => {
        const response = await api.post('/hairdressers/services', serviceData);
        return response.data;
    },

    updateService: async (serviceId, serviceData) => {
        const response = await api.post('/hairdressers/services', { serviceId, ...serviceData });
        return response.data;
    },

    deleteService: async (serviceId) => {
        const response = await api.delete(`/hairdressers/services/${serviceId}`);
        return response.data;
    }
};

// Appointment API
export const appointmentAPI = {
    // Create a new appointment
    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    // Get appointments for the logged‑in user (client or hairdresser)
    getMyAppointments: async () => {
        const response = await api.get('/appointments');
        return response.data;
    },

    // Get a single appointment by its ID
    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Update the status of an appointment (confirm, cancel, etc.)
    updateStatus: async (id, status, cancellationReason = null) => {
        const response = await api.put(`/appointments/${id}/status`, { status, cancellationReason });
        return response.data;
    },

    // Fetch available time slots for a given hairdresser and date
    getAvailableSlots: async (hairdresserProfileId, date) => {
        const response = await api.get('/appointments/slots', { params: { hairdresserProfileId, date } });
        return response.data;
    }
};

export const reviewAPI = {
    // Fetch reviews for a specific hairdresser
    getHairdresserReviews: async (hairdresserId) => {
        const response = await api.get(`/reviews/hairdresser/${hairdresserId}`);
        return response.data;
    },
    // Create a new review (expects {hairdresserProfileId, rating, comment})
    create: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    }
};

export const adminAPI = {
    // Dashboard statistics
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    // Users management
    getAllUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },
    toggleUserStatus: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/toggle`);
        return response.data;
    },
    changeUserRole: async (userId, role) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },
    // Appointments management
    getAllAppointments: async (params) => {
        const response = await api.get('/admin/appointments', { params });
        return response.data;
    },
    updateAppointmentStatus: async (id, data) => {
        const response = await api.put(`/admin/appointments/${id}/status`, data);
        return response.data;
    },
    deleteAppointment: async (id) => {
        const response = await api.delete(`/admin/appointments/${id}`);
        return response.data;
    }
};


