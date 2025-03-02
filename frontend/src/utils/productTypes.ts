// Common product-related type definitions

import { ProductCreate, ProductUpdate } from "../client";

/**
 * Extended product create type to include id field
 */
export interface ProductCreateWithId extends ProductCreate {
  id: string;
}

/**
 * Interface for form field configuration
 */
export interface FormField {
  id: keyof (ProductCreateWithId | ProductUpdate);
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
    min?: {
      value: number;
      message: string;
    };
  };
  options?: Array<{ value: string; label: string }>;
}

/**
 * Interface for form section configuration
 */
export interface FormSection {
  section: string;
  fields: FormField[];
}

/**
 * Type for product dimensions
 */
export interface ProductDimensions {
  width?: number;
  length?: number;
  thickness?: number;
}

/**
 * Interface for formatted product data with additional derived fields
 */
export interface FormattedProduct {
  id: string;
  brand: string;
  type: string;
  unitPrice: string;
  unitCost: string;
  priceCurrency: string;
  costCurrency: string;
  dimensions: string;
  isValid: boolean;
} 