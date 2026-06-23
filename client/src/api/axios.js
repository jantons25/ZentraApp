import axios from 'axios';
import { getSede, clearSede } from '../lib/sedeStore.js';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:3000/api',
    withCredentials: true,
    timeout: 30000,
});

instance.interceptors.request.use((config) => {
    const sede = getSede();
    if (sede) {
        config.headers['X-Sede'] = sede;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isVerifyRoute = error.config?.url?.includes('/verify');
            if (!isVerifyRoute) {
                clearSede();
                window.location.href = '/login';
            }
        }
        if (error.response?.status === 429) {
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error('Demasiadas solicitudes. Espera un momento e intenta de nuevo.', {
                    id: 'rate-limit',
                    duration: 5000,
                });
            });
        }
        return Promise.reject(error);
    }
);

export default instance;
