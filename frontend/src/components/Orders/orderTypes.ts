// Common types and interfaces for Order components

/**
 * Interface for order item inputs in forms
 */
export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

/**
 * Interface for form field configuration
 */
export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  validation?: {
    required?: string;
    min?: { value: number; message: string };
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
 * Interface for parsed order items with product details
 */
export interface OrderItem {
  product_id: string;
  quantity: number;
  product_name?: string;
  product_brand?: string;
  product_type?: string;
  unit_price?: number;
  price_currency?: string;
  total_price?: number;
}

/**
 * Helper function to parse order items from JSON string
 * @param orderItemsJson - JSON string of order items
 * @returns Array of OrderItemInput objects
 */
export const parseOrderItems = (orderItemsJson?: string | null): OrderItemInput[] => {
  try {
    if (!orderItemsJson) return [{ product_id: "", quantity: 1 }];
    
    const orderItemsObj = JSON.parse(orderItemsJson);
    return Object.entries(orderItemsObj).map(([product_id, quantity]) => ({
      product_id,
      quantity: Number(quantity)
    }));
  } catch (e) {
    console.error("Error parsing order items:", e);
    return [{ product_id: "", quantity: 1 }];
  }
}; 