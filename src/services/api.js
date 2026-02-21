import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token si existe (opcional por ahora, pero preparado)
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

export const getPlaces = async (params = {}) => {
    try {
        const response = await api.get('/lugares', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching places:', error);
        throw error;
    }
};

export const getPlaceById = async (id) => {
    try {
        const response = await api.get(`/lugares/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching place ${id}:`, error);
        throw error;
    }
};

export const createPlace = async (placeData) => {
    try {
        const response = await api.post('/lugares', placeData);
        return response.data;
    } catch (error) {
        console.error('Error creating place:', error);
        throw error;
    }
};

export const getEvents = async (params = {}) => {
    try {
        const response = await api.get('/eventos', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const getEventById = async (id) => {
    try {
        const response = await api.get(`/eventos/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event ${id}:`, error);
        throw error;
    }
};

export const createEvent = async (eventData) => {
    // Para eventos con archivos (imágenes/videos), podríamos necesitar FormData
    // pero por ahora el endpoint parece aceptar JSON según la descripción 'Body (raw JSON)' para lugares.
    // Sin embargo, para archivos, lo estándar es FormData.
    // Asumiremos JSON por la consistencia con lugares, o FormData si detectamos archivos.

    // Si eventData es una instancia de FormData, axios lo maneja automáticamente.
    try {
        const response = await api.post('/eventos', eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

export const getTags = async (type = 'lugar') => {
    try {
        const response = await api.get('/lugares/tags', { params: { tipo: type } });
        return response.data;
    } catch (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }
};

export default api;
