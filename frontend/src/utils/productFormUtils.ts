// Common product form utilities

import { BRAND_OPTIONS, CURRENCY_OPTIONS, PRODUCT_TYPE_OPTIONS } from './productConstants';
import { FormSection, ProductCreateWithId } from './productTypes';
import { ProductPublic } from '../client';
import { getCurrencySymbol } from './currencyUtils';

/**
 * Returns form sections configuration for product forms
 */
export const getProductFormSections = (): FormSection[] => {
  return [
    {
      section: "Basic Information",
      fields: [
        {
          id: "id",
          label: "Product Name",
          required: true,
          placeholder: "Enter product name",
          validation: {
            required: "Product name is required",
          }
        },
        {
          id: "brand",
          label: "Brand",
          required: true,
          placeholder: "Enter brand name",
          validation: {
            required: "Brand is required",
          },
          type: "select",
          options: BRAND_OPTIONS
        },
        {
          id: "type",
          label: "Product Type",
          placeholder: "Select product type",
          type: "select",
          options: PRODUCT_TYPE_OPTIONS
        }
      ]
    },
    {
      section: "Pricing",
      fields: [
        {
          id: "unit_price",
          label: "Unit Price",
          required: true,
          placeholder: "Enter unit price",
          type: "number",
          validation: {
            required: "Unit price is required",
          }
        },
        {
          id: "price_currency",
          label: "Price Currency",
          placeholder: "Select currency",
          type: "select",
          options: CURRENCY_OPTIONS
        },
        {
          id: "unit_cost",
          label: "Unit Cost",
          placeholder: "Enter unit cost",
          type: "number"
        },
        {
          id: "cost_currency",
          label: "Cost Currency",
          placeholder: "Select currency",
          type: "select",
          options: CURRENCY_OPTIONS
        }
      ]
    },
    {
      section: "Dimensions",
      fields: [
        {
          id: "width",
          label: "Width (m)",
          placeholder: "1.2",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Width must be greater than 0"
            }
          }
        },
        {
          id: "length",
          label: "Length (m)",
          placeholder: "50",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Length must be greater than 0"
            }
          }
        },
        {
          id: "thickness",
          label: "Thickness (mm)",
          placeholder: "0.18",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Thickness must be greater than 0"
            }
          }
        }
      ]
    }
  ];
};

/**
 * Format dimensions as a string
 */
export const formatDimensions = (product: ProductPublic): string => {
  if (!product.width && !product.length && !product.thickness) return 'N/A';
  
  const dimensions = [];
  if (product.width != null) dimensions.push(`${product.width}m`);
  if (product.length != null) dimensions.push(`${product.length}m`);
  if (product.thickness != null) dimensions.push(`${product.thickness}mm`);
  
  return dimensions.join(' × ');
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (amount: number | null | undefined, currency: string | null | undefined): string => {
  if (amount == null) return 'N/A';
  return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;
}; 