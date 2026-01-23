import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
console.log(API_URL,'here is the url')
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/user/'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profiles/me/'),
  updateProfile: (data) => api.put('/profiles/update_me/', data),
};

// Skills APIs
export const skillsAPI = {
  getAll: (params) => api.get('/skills/', { params }),
  create: (data) => api.post('/skills/', data),
  update: (id, data) => api.put(`/skills/${id}/`, data),
  delete: (id) => api.delete(`/skills/${id}/`),
};

// Journal APIs
export const journalAPI = {
  getAll: (params) => api.get('/journal/', { params }),
  create: (data) => api.post('/journal/', data),
  update: (id, data) => api.put(`/journal/${id}/`, data),
  delete: (id) => api.delete(`/journal/${id}/`),
  getById: (id) => api.get(`/journal/${id}/`),
};

// Projects APIs
export const projectsAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  getById: (id) => api.get(`/projects/${id}/`),
};

// Resources APIs
export const resourcesAPI = {
  getAll: (params) => api.get('/resources/', { params }),
  create: (data) => api.post('/resources/', data),
  update: (id, data) => api.put(`/resources/${id}/`, data),
  delete: (id) => api.delete(`/resources/${id}/`),
};

// Snippets APIs
export const snippetsAPI = {
  getAll: (params) => api.get('/snippets/', { params }),
  create: (data) => api.post('/snippets/', data),
  update: (id, data) => api.put(`/snippets/${id}/`, data),
  delete: (id) => api.delete(`/snippets/${id}/`),
  getById: (id) => api.get(`/snippets/${id}/`),
};

// Goals APIs
export const goalsAPI = {
  getAll: (params) => api.get('/goals/', { params }),
  create: (data) => api.post('/goals/', data),
  update: (id, data) => api.put(`/goals/${id}/`, data),
  delete: (id) => api.delete(`/goals/${id}/`),
};

// Activities APIs
export const activitiesAPI = {
  getAll: (params) => api.get('/activities/', { params }),
  create: (data) => api.post('/activities/', data),
  update: (id, data) => api.put(`/activities/${id}/`, data),
  delete: (id) => api.delete(`/activities/${id}/`),
  getWeeklyStats: () => api.get('/activities/weekly_stats/'),
  getMonthlyStats: () => api.get('/activities/monthly_stats/'),
};

export default api;

// Add these new API endpoints at the end of the file

// GitHub APIs
export const githubAPI = {
  syncGitHub: () => api.post('/github/sync/'),
  getStats: () => api.get('/github/stats/'),
  getContributionGraph: (days = 365) => api.get('/github/graph/', { params: { days } }),
  getRepos: (params) => api.get('/github/repos/', { params }),
  getCommits: (params) => api.get('/github/commits/', { params }),
  getContributions: (params) => api.get('/github/contributions/', { params }),
};