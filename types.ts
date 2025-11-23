export interface User {
  id: string;
  name: string;
  email: string;
}

export type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';

export interface ValidationRules {
  min?: number;       // For number type
  max?: number;       // For number type
  minLength?: number; // For text/textarea
  maxLength?: number; // For text/textarea
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  helpText?: string; // Additional instruction text
  validation?: ValidationRules; // New validation constraints
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  isPublished: boolean;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}