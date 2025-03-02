// Common customer-related type definitions

import { CustomerCreate, CustomerUpdate } from "../client";

/**
 * Interface for form field configuration
 */
export interface FormField {
  id: keyof (CustomerCreate | CustomerUpdate);
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  validation?: {
    required?: string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
  };
  options?: Array<{ value: string; label: string }>;
  component?: React.ReactNode;
}

/**
 * Interface for form section configuration
 */
export interface FormSection {
  section: string;
  fields: FormField[];
}

/**
 * Interface for formatted customer data with additional derived fields
 */
export interface FormattedCustomer {
  id: string;
  company: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  preferredLanguage?: string;
  address?: string;
  description?: string;
  isValid: boolean;
} 