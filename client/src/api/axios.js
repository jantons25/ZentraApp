import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:4000/api',
    withCredentials: true,
    timeout: 30000,
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isVerifyRoute = error.config?.url?.includes('/verify');
            if (!isVerifyRoute) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
