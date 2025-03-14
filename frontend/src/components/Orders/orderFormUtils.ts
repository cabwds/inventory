// Common form utilities and configuration for order forms
import { FormSection } from './orderTypes';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../../utils/orderConstants';

/**
 * Default form sections configuration for order forms
 */
export const getOrderFormSections = (): FormSection[] => {
  return [
    {
      section: "Basic Information",
      fields: [
        {
          id: "customer_id",
          label: "Customer",
          required: true,
          placeholder: "Select customer",
          type: "select",
          validation: {
            required: "Customer is required",
          }
        },
        {
          id: "order_status",
          label: "Order Status",
          placeholder: "Select order status",
          type: "select",
          options: ORDER_STATUS_OPTIONS
        },
        {
          id: "payment_status",
          label: "Payment Status",
          placeholder: "Select payment status",
          type: "select",
          options: PAYMENT_STATUS_OPTIONS
        },
        {
          id: "total_price",
          label: "Total Price (SGD, Auto-calculated)",
          required: true,
          placeholder: "Enter total price",
          type: "number",
          validation: {
            required: "Total price is required",
            min: { value: 0, message: "Price cannot be negative" }
          }
        }
      ]
    },
    {
      section: "Additional Information",
      fields: [
        {
          id: "notes",
          label: "Notes",
          placeholder: "Enter notes",
          type: "textarea"
        }
      ]
    }
  ];
};

/**
 * Updates the form sections to remove order_items, order_quantity and total_price fields
 * since they are handled separately in the form
 */
export const processFormSections = (formSections: FormSection[]): FormSection[] => {
  return formSections.map(section => {
    if (section.section === "Basic Information") {
      // Filter out order_items, order_quantity, and total_price fields
      const filteredFields = section.fields.filter(
        field => field.id !== "order_items" && 
                field.id !== "order_quantity" && 
                field.id !== "total_price"
      );
      
      return {
        ...section,
        fields: filteredFields
      };
    }
    return section;
  });
};

/**
 * Gets the set of already selected product IDs in a form
 */
export const getSelectedProductIds = (fields: any[], getValues: Function, currentIndex: number): Set<string> => {
  return new Set(
    fields
      .map((idx) => idx !== currentIndex ? getValues(`orderItemInputs.${idx}.product_id`) : null)
      .filter(id => id !== null && id !== "")
  );
}; 