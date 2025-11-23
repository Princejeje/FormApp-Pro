/**
 * NOTE: In a real production environment, this file would be replaced by
 * Node.js/Express backend API calls. This "Mock Backend" ensures the
 * application works immediately in the browser for demonstration purposes
 * while maintaining the architecture of a full-stack app.
 */

import { User, Form, Submission, AuthResponse } from '../types';

const STORAGE_KEYS = {
  USERS: 'fap_users',
  FORMS: 'fap_forms',
  SUBMISSIONS: 'fap_submissions',
  SESSION: 'fap_session',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

export const mockRegister = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const token = `mock-jwt-${Date.now()}`;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user: newUser, token }));

  return { user: newUser, token };
};

export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  let user = users.find(u => u.email === email);

  // AUTOMATIC DEMO USER GENERATION
  // If the user tries to login with demo credentials and they don't exist yet, create them.
  if (!user && email === 'demo@example.com' && password === 'password') {
    user = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // In a real app, we would bcrypt.compare(password, user.passwordHash)
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const token = `mock-jwt-${Date.now()}`;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, token }));

  return { user, token };
};

export const mockLogout = async () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getSession = (): { user: User; token: string } | null => {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

// --- Form Services ---

export const getForms = async (userId: string): Promise<Form[]> => {
  await delay(300);
  const forms: Form[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
  return forms.filter(f => f.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getFormById = async (formId: string): Promise<Form | undefined> => {
  await delay(300);
  const forms: Form[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
  return forms.find(f => f.id === formId);
};

export const createForm = async (userId: string, title: string, description: string): Promise<Form> => {
  await delay(400);
  const forms: Form[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
  
  const newForm: Form = {
    id: crypto.randomUUID(),
    userId,
    title,
    description,
    fields: [],
    createdAt: new Date().toISOString(),
    isPublished: true,
  };

  forms.push(newForm);
  localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
  return newForm;
};

export const updateForm = async (form: Form): Promise<Form> => {
  await delay(400);
  const forms: Form[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
  const index = forms.findIndex(f => f.id === form.id);
  
  if (index !== -1) {
    forms[index] = form;
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    return form;
  }
  throw new Error('Form not found');
};

export const deleteForm = async (formId: string): Promise<void> => {
  await delay(300);
  let forms: Form[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
  forms = forms.filter(f => f.id !== formId);
  localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
};

// --- Submission Services ---

export const submitFormEntry = async (formId: string, data: Record<string, any>): Promise<void> => {
  await delay(500);
  const submissions: Submission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
  
  const newSubmission: Submission = {
    id: crypto.randomUUID(),
    formId,
    data,
    submittedAt: new Date().toISOString(),
  };

  submissions.push(newSubmission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

export const getFormSubmissions = async (formId: string): Promise<Submission[]> => {
  await delay(400);
  const submissions: Submission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
  return submissions.filter(s => s.formId === formId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};