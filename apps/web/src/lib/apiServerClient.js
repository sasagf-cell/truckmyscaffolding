import pb from '@/lib/pocketbaseClient';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const apiServerClient = {
    fetch: async (url, options = {}) => {
        const token = pb.authStore.token;
        const headers = {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        return await window.fetch(API_BASE + url, { ...options, headers });
    }
};

export default apiServerClient;

export { apiServerClient };
