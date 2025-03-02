// Common customer form utilities

import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from './customerConstants';
import { FormSection } from './customerTypes';
import { CustomerPublic } from '../client';

/**
 * Returns form sections configuration for customer forms
 * @param isEditMode - Whether the form is in edit mode
 * @returns Form sections configuration
 */
export const getCustomerFormSections = (isEditMode: boolean = false): FormSection[] => {
  return [
    {
      section: "Basic Information",
      fields: [
        {
          id: "company",
          label: "Company",
          required: true,
          placeholder: "Enter company name",
          validation: {
            required: "Company name is required",
          }
        },
        {
          id: "full_name",
          label: "Full Name",
          placeholder: "Enter full name"
        },
        {
          id: "gender",
          label: "Gender",
          placeholder: "Select gender",
          type: "select",
          options: GENDER_OPTIONS
        }
      ]
    },
    {
      section: "Contact Details",
      fields: [
        {
          id: "email",
          label: "Email",
          placeholder: "Enter email address",
          type: "email",
        },
        {
          id: "phone",
          label: "Phone",
          required: true, // Required for new customers, optional for edits
          placeholder: "Enter phone number",
          validation: {
            required: "Phone number is required",
          }
        },
        {
          id: "address",
          label: "Address",
          placeholder: "Enter address"
        }
      ]
    },
    {
      section: "Additional Information",
      fields: [
        {
          id: "preferred_language",
          label: "Preferred Language",
          placeholder: "Select preferred language",
          type: "select",
          options: LANGUAGE_OPTIONS
        },
        {
          id: "description",
          label: "Description",
          placeholder: "Enter description"
        }
      ]
    }
  ];
};

/**
 * Format customer data for display
 * @param customer - The customer data
 * @returns Formatted customer data
 */
export const formatCustomerData = (customer: CustomerPublic): Record<string, any> => {
  return {
    company: customer.company || 'N/A',
    fullName: customer.full_name || 'N/A',
    email: customer.email || 'N/A',
    phone: customer.phone || 'N/A',
    gender: customer.gender || 'N/A',
    preferredLanguage: customer.preferred_language || 'N/A',
    address: customer.address || 'N/A',
    description: customer.description || 'N/A',
    isValid: customer.is_valid !== false, // Default to true if not explicitly false
  };
}; 