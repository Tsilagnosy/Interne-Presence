import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'AFRIMARKET_ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'AFRIMARKET_REFRESH_TOKEN';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const defaultApiBaseUrl = '/api/';

const baseURL = apiBaseUrl || defaultApiBaseUrl;

if (typeof window !== 'undefined') {
  if (!apiBaseUrl) {
    console.warn(
      '[AFRIMARKET API] NEXT_PUBLIC_API_BASE_URL is not set. Using fallback baseURL:',
      baseURL
    );
  } else {
    console.debug('[AFRIMARKET API] baseURL:', baseURL);
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredToken = (key: string) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      const refreshToken = getStoredToken(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(`${baseURL}token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access as string;
          window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return api(originalRequest);
        } catch (_refreshError) {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
	
	
	
	
	
	
	
	
	
	
	