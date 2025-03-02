import { FormSection } from "../components/Orders/orderTypes";
import { CURRENCY_OPTIONS } from "./productConstants";
import { ORDER_STATUS_OPTIONS as STATUS_OPTIONS } from "./orderConstants";

export function getOrderFormSections(isEditMode: boolean = false): FormSection[] {
  return [
    {
      section: "Basic Information",
      fields: [
        {
          id: "customer_id",
          label: "Customer",
          placeholder: "Select customer",
          required: true,
          type: "select",
          validation: {
            required: "Customer is required",
          },
        },
        {
          id: "order_number",
          label: "Order Number",
          placeholder: "Enter order number",
          required: true,
          validation: {
            required: "Order number is required",
          },
        },
        {
          id: "order_date",
          label: "Order Date",
          placeholder: "Enter order date",
          required: true,
          type: "date",
          validation: {
            required: "Order date is required",
          },
        },
        {
          id: "currency",
          label: "Currency",
          placeholder: "Select currency",
          required: true,
          type: "select",
          options: CURRENCY_OPTIONS,
          validation: {
            required: "Currency is required",
          },
        },
        // total_price field is removed as it's now handled separately
      ],
    },
    {
      section: "Additional Information",
      fields: [
        {
          id: "status",
          label: "Status",
          placeholder: "Select status",
          required: true,
          type: "select",
          options: STATUS_OPTIONS,
          validation: {
            required: "Status is required",
          },
        },
        {
          id: "delivery_date",
          label: "Delivery Date",
          placeholder: "Enter delivery date",
          type: "date",
          validation: {},
        },
        {
          id: "payment_date",
          label: "Payment Date",
          placeholder: "Enter payment date",
          type: "date",
          validation: {},
        },
        {
          id: "notes",
          label: "Notes",
          placeholder: "Enter any additional notes",
          type: "textarea",
          validation: {},
        },
      ],
    },
  ];
} 