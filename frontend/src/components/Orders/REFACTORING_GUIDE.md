# Orders Component Refactoring Guide

This document outlines how to use the shared utilities and components that were created to reduce code duplication in the order-related features.

## Shared Utilities

### Currency Utilities (`frontend/src/utils/currencyUtils.ts`)

Contains common currency-related functionality:

- `CURRENCY_CONVERSION_RATES`: Constants for converting currencies to SGD
- `convertToSGD()`: Function to convert prices from any currency to SGD
- `getCurrencySymbol()`: Helper to get the appropriate symbol for a currency code
- `formatSGDPrice()`: Format a price with 2 decimal places

Usage example:
```typescript
import { convertToSGD, getCurrencySymbol } from "../../utils/currencyUtils";

// Convert USD to SGD
const priceInSGD = convertToSGD(29.99, "USD");

// Get currency symbol
const symbol = getCurrencySymbol("EUR"); // Returns "€"
```

### Order Constants (`frontend/src/utils/orderConstants.ts`)

Contains shared constants for order-related components:

- `ORDER_STATUS_OPTIONS`: Options for order status dropdowns
- `PAYMENT_STATUS_OPTIONS`: Options for payment status dropdowns 
- `STATUS_COLORS`: Color mapping for status badges

Usage example:
```typescript
import { ORDER_STATUS_OPTIONS, STATUS_COLORS } from "../../utils/orderConstants";

// Use in a select component
<Select>
  {ORDER_STATUS_OPTIONS.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</Select>

// Use for color mapping
<Badge colorScheme={STATUS_COLORS[status]}>
  {status}
</Badge>
```

## Shared Types and Interfaces (`frontend/src/components/Orders/orderTypes.ts`)

Contains common interfaces used across order components:

- `OrderItemInput`: Interface for order items in forms
- `FormField`: Configuration for form fields
- `FormSection`: Configuration for form sections
- `OrderItem`: Interface for parsed order items with product details
- `parseOrderItems()`: Helper to parse order items from JSON string

Usage example:
```typescript
import { OrderItemInput, parseOrderItems } from "./orderTypes";

// Parse order items from JSON string
const orderItems = parseOrderItems(order.order_items);
```

## Form Utilities (`frontend/src/components/Orders/orderFormUtils.ts`)

Utilities for form configuration and processing:

- `getOrderFormSections()`: Get default form sections for order forms
- `processFormSections()`: Process form sections to update labels and remove fields
- `getSelectedProductIds()`: Get set of already selected product IDs

Usage example:
```typescript
import { getOrderFormSections, processFormSections } from "./orderFormUtils";

// Get and process form sections
const formSections = getOrderFormSections();
const updatedFormSections = processFormSections(formSections);
```

## Shared Components

### OrderItemsField (`frontend/src/components/Orders/OrderItemsField.tsx`)

Reusable component for the order items section of forms.

Usage example:
```typescript
import OrderItemsField from "./OrderItemsField";

// Inside your form component
<OrderItemsField
  control={control}
  register={register}
  errors={errors}
  getValues={getValues}
  setValue={setValue}
  products={products}
  manuallyEditedTotal={manuallyEditedTotal}
  watch={watch}
/>
```

### TotalPriceField (`frontend/src/components/Orders/TotalPriceField.tsx`)

Reusable component for the total price field with animation and manual edit functionality.

Usage example:
```typescript
import TotalPriceField from "./TotalPriceField";

// Inside your form component
<TotalPriceField
  id="total_price"
  label="Total Price (SGD, Auto-calculated)"
  register={register}
  errors={errors}
  setValue={setValue}
  showTotalAnimation={showTotalAnimation}
  manuallyEditedTotal={manuallyEditedTotal}
  setManuallyEditedTotal={setManuallyEditedTotal}
/>
```

## Refactoring Implementation Steps

To refactor the existing components to use these shared utilities:

1. Import the shared utilities/components in the component files
2. Replace the existing implementations with calls to the shared utilities/components
3. Remove redundant code such as constant declarations, helper functions, and duplicated JSX

### Example for AddOrder.tsx and EditOrder.tsx

Replace:
```typescript
// Duplicated currency conversion code
const CURRENCY_CONVERSION_RATES = { ... };
const convertToSGD = (price, currency) => { ... };
```

With:
```typescript
import { convertToSGD } from "../../utils/currencyUtils";
```

Replace order status constants:
```typescript
const ORDER_STATUS_OPTIONS = [ ... ];
const PAYMENT_STATUS_OPTIONS = [ ... ];
```

With:
```typescript
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "../../utils/orderConstants";
```

Replace the order items rendering section with:
```tsx
<OrderItemsField
  control={control}
  register={register}
  errors={errors}
  getValues={getValues}
  setValue={setValue}
  products={products}
  manuallyEditedTotal={manuallyEditedTotal}
  watch={watch}
/>
``` 