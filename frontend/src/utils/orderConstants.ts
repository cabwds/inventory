// Common order-related constants used across components

// Order status options for dropdowns
export const ORDER_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

// Payment status options for dropdowns
export const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
];

// Status color mapping for visual indicators
export const STATUS_COLORS = {
  "Pending": "yellow",
  "Processing": "blue",
  "Shipped": "purple",
  "Delivered": "green",
  "Cancelled": "red",
  "Paid": "green",
  "Failed": "red",
  "Refunded": "orange"
}; 