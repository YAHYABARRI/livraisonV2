import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse globalement (ex: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou non autorisée - Déconnexion automatique");
      localStorage.removeItem('token');

      const isPublicPath =
        window.location.pathname === '/' ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/register' ||
        window.location.pathname.startsWith('/track');

      if (!isPublicPath) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints Auth
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Endpoints Client / Colis
export const parcelService = {
  create: async (parcelData) => {
    const response = await api.post('/parcels', parcelData);
    return response.data;
  },
  getAllMyParcels: async (page, size, search = '') => {
    const params = { search };
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    const response = await api.get('/parcels', { params });
    return response.data;
  },
  getById: async (trackingId) => {
    const response = await api.get(`/parcels/${trackingId}`);
    return response.data;
  },
  track: async (trackingId) => {
    const response = await api.get(`/parcels/track/${trackingId}`);
    return response.data;
  }
};

// Endpoints Notifications
export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

// Endpoints Livreur
export const driverService = {
  getAssignedParcels: async () => {
    const response = await api.get('/driver/parcels');
    return response.data;
  },
  updateStatus: async (parcelId, statusData) => {
    const response = await api.put(`/driver/parcels/${parcelId}/status`, statusData);
    return response.data;
  },
};

// Endpoints Administrateur
export const adminService = {
  getUsers: async (page, size, search = '') => {
    const params = { search };
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getDrivers: async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
  },
  getAllParcels: async (page, size, search = '') => {
    const params = { search };
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    const response = await api.get('/admin/parcels', { params });
    return response.data;
  },
  assignDriver: async (assignmentData) => {
    const response = await api.post('/admin/assign-driver', assignmentData);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

// Endpoints Rapports PDF
export const reportService = {
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  },
  getDailyPdf: async () => {
    const response = await api.get('/reports/daily', { responseType: 'blob' });
    return response.data;
  },
  getWeeklyPdf: async () => {
    const response = await api.get('/reports/weekly', { responseType: 'blob' });
    return response.data;
  },
  getMonthlyPdf: async () => {
    const response = await api.get('/reports/monthly', { responseType: 'blob' });
    return response.data;
  },
  getCustomPdf: async (params) => {
    const response = await api.get('/reports/custom', { params, responseType: 'blob' });
    return response.data;
  },
  getMultiClientsPdf: async (data) => {
    const response = await api.post('/reports/by-clients', data, { responseType: 'blob' });
    return response.data;
  },
  getDriverPdf: async (driverId, params) => {
    const response = await api.get(`/reports/by-deliveryman/${driverId}`, { params, responseType: 'blob' });
    return response.data;
  },
  getClientPdf: async (clientId, params) => {
    const response = await api.get(`/reports/by-client/${clientId}`, { params, responseType: 'blob' });
    return response.data;
  }
};

// Endpoints Tickets de livraison PDF
export const ticketService = {
  getSelectedTicketsPdf: async (parcelIds) => {
    const response = await api.post('/tickets/selected', { parcelIds }, { responseType: 'blob' });
    return response.data;
  },
  getDailyTicketsPdf: async (date) => {
    const response = await api.get('/tickets/day', {
      params: { date },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
