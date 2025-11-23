import axios from 'axios';
import { Form, User, Submission, AuthResponse } from '../types';

// INTELLIGENT URL DETECTION:
const getBaseUrl = () => {
  // 1. Production Build (Vite/Browser)
  // When built via 'npm run build', import.meta.env.PROD is true
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.PROD) {
      // In production (served by Nginx or Node), API is relative
      return '/api';
    }
  } catch (e) {
    // Ignore access errors
  }

  // 2. Environment Variable Override
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_API_URL) {
      // @ts-ignore
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {}

  // 3. Browser Context Fallback
  // If we are on the VPS IP, use relative path
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api';
    }
  }

  // 4. Local Development Fallback
  return 'http://localhost:3001/api';
};

const API_URL = getBaseUrl();
console.log("API URL configured to:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Add JWT to headers automatically
api.interceptors.request.use((config) => {
  const sessionStr = localStorage.getItem('fap_session');
  if (sessionStr) {
    const session = JSON.parse(sessionStr);
    if (session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

// --- Auth Adapters ---

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('fap_session', JSON.stringify(res.data));
  return res.data;
};

export const mockRegister = register;

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('fap_session', JSON.stringify(res.data));
  return res.data;
};

export const mockLogin = login;

export const logout = async () => {
  localStorage.removeItem('fap_session');
};

export const mockLogout = logout;

export const getSession = (): { user: User; token: string } | null => {
  const session = localStorage.getItem('fap_session');
  return session ? JSON.parse(session) : null;
};

// --- Form Services ---

export const getForms = async (userId: string): Promise<Form[]> => {
  const res = await api.get('/forms');
  return res.data;
};

export const getFormById = async (id: string): Promise<Form> => {
  const res = await api.get(`/forms/${id}`);
  return res.data;
};

export const getPublicFormById = async (id: string): Promise<Form> => {
  const res = await api.get(`/public/forms/${id}`);
  return res.data;
};

export const createForm = async (userId: string, title: string, description: string): Promise<Form> => {
  // userId is ignored by backend (uses token), but kept here for signature compatibility
  const res = await api.post('/forms', { title, description, fields: [] });
  return res.data;
};

export const updateForm = async (form: Form): Promise<Form> => {
  const res = await api.put(`/forms/${form.id}`, form);
  return res.data;
};

export const deleteForm = async (id: string): Promise<void> => {
  await api.delete(`/forms/${id}`);
};

// --- Submission Services ---

export const submitFormEntry = async (formId: string, data: Record<string, any>): Promise<void> => {
  await api.post(`/forms/${formId}/submit`, { data });
};

export const getFormSubmissions = async (formId: string): Promise<Submission[]> => {
  const res = await api.get(`/forms/${formId}/submissions`);
  return res.data;
};