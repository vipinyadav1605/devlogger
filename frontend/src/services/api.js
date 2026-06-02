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
  login: (credentials) => api.post('api/auth/login/', credentials),
  register: (userData) => api.post('api/auth/register/', userData),
  getCurrentUser: () => api.get('api/auth/user/'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('api/dashboard/stats/'),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('api/profiles/me/'),
  updateProfile: (data) => api.put('api/profiles/update_me/', data),
};

// Skills APIs
export const skillsAPI = {
  getAll: (params) => api.get('api/skills/', { params }),
  create: (data) => api.post('api/skills/', data),
  update: (id, data) => api.put(`api/skills/${id}/`, data),
  delete: (id) => api.delete(`api/skills/${id}/`),
};

// Journal APIs
export const journalAPI = {
  getAll: (params) => api.get('api/journal/', { params }),
  create: (data) => api.post('api/journal/', data),
  update: (id, data) => api.put(`api/journal/${id}/`, data),
  delete: (id) => api.delete(`api/journal/${id}/`),
  getById: (id) => api.get(`api/journal/${id}/`),
};

// Projects APIs
export const projectsAPI = {
  getAll: (params) => api.get('api/projects/', { params }),
  create: (data) => api.post('api/projects/', data),
  update: (id, data) => api.put(`api/projects/${id}/`, data),
  delete: (id) => api.delete(`api/projects/${id}/`),
  getById: (id) => api.get(`api/projects/${id}/`),
};

// Resources APIs
export const resourcesAPI = {
  getAll: (params) => api.get('api/resources/', { params }),
  create: (data) => api.post('api/resources/', data),
  update: (id, data) => api.put(`api/resources/${id}/`, data),
  delete: (id) => api.delete(`api/resources/${id}/`),
};

// Snippets APIs
export const snippetsAPI = {
  getAll: (params) => api.get('api/snippets/', { params }),
  create: (data) => api.post('api/snippets/', data),
  update: (id, data) => api.put(`api/snippets/${id}/`, data),
  delete: (id) => api.delete(`api/snippets/${id}/`),
  getById: (id) => api.get(`api/snippets/${id}/`),
};

// Goals APIs
export const goalsAPI = {
  getAll: (params) => api.get('api/goals/', { params }),
  create: (data) => api.post('api/goals/', data),
  update: (id, data) => api.put(`api/goals/${id}/`, data),
  delete: (id) => api.delete(`api/goals/${id}/`),
};

// Activities APIs
export const activitiesAPI = {
  getAll: (params) => api.get('api/activities/', { params }),
  create: (data) => api.post('api/activities/', data),
  update: (id, data) => api.put(`api/activities/${id}/`, data),
  delete: (id) => api.delete(`api/activities/${id}/`),
  getWeeklyStats: () => api.get('api/activities/weekly_stats/'),
  getMonthlyStats: () => api.get('api/activities/monthly_stats/'),
};

export default api;

// Add these new API endpoints at the end of the file

// GitHub APIs
export const githubAPI = {
  syncGitHub: () => api.post('api/github/sync/'),
  getStats: () => api.get('api/github/stats/'),
  getContributionGraph: (days = 365) => api.get('api/github/graph/', { params: { days } }),
  getRepos: (params) => api.get('api/github/repos/', { params }),
  getCommits: (params) => api.get('api/github/commits/', { params }),
  getContributions: (params) => api.get('api/github/contributions/', { params }),
};