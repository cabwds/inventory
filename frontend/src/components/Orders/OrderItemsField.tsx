import React from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  GridItem,
  HStack,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useFieldArray, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { OrderItemInput } from "./orderTypes";
import { getCurrencySymbol, convertToSGD } from "../../utils/currencyUtils";
import { getSelectedProductIds } from "./orderFormUtils";
import { editCustomerStyles } from "../../styles/customers.styles";

interface OrderItemsFieldProps {
  control: any;
  register: UseFormRegister<any>;
  errors: any;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  products: any;
  manuallyEditedTotal: boolean;
  watch: any;
  shouldMarkDirty?: boolean;
}

/**
 * Reusable component for order items section in forms
 */
const OrderItemsField = ({
  control,
  register,
  errors,
  getValues,
  setValue,
  products,
  manuallyEditedTotal,
  watch,
  shouldMarkDirty = false
}: OrderItemsFieldProps) => {
  // Use field array for dynamic order items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderItemInputs",
  });

  // Watch orderItemInputs for calculations and UI updates
  const orderItemInputs = watch("orderItemInputs");

  // Function to calculate and display item subtotal
  const calculateItemSubtotal = (productId: string, quantity: number) => {
    const product = products?.data?.find((p: any) => p.id === productId);
    if (product?.unit_price) {
      // Show the original currency first, then the SGD equivalent
      const subtotal = product.unit_price * quantity;
      const subtotalSGD = convertToSGD(product.unit_price, product.price_currency) * quantity;
      return `${getCurrencySymbol(product.price_currency)}${subtotal.toFixed(2)} (S$${subtotalSGD.toFixed(2)})`;
    }
    return 'N/A';
  };

  return (
    <Box>
      <Text {...editCustomerStyles.sectionTitle}>
        Order Items
      </Text>
      <VStack spacing={3} align="stretch">
        {fields.map((field, index) => (
          <Box 
            key={field.id} 
            border="1px solid" 
            borderColor="gray.200" 
            p={2} 
            borderRadius="md"
            _hover={{ borderColor: "blue.200", boxShadow: "xs" }}
          >
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">Item {index + 1}</Text>
              {index > 0 && (
                <IconButton
                  size="xs"
                  aria-label="Remove item"
                  icon={<DeleteIcon />}
                  onClick={() => remove(index)}
                  colorScheme="red"
                  variant="ghost"
                />
              )}
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={2} alignItems="flex-end">
              <GridItem colSpan={{ base: 1, md: 3 }}>
                <FormControl isInvalid={!!errors.orderItemInputs?.[index]?.product_id} size="sm">
                  <FormLabel htmlFor={`orderItemInputs.${index}.product_id`} fontSize="xs" mb={1}>Product</FormLabel>
                  <Select
                    id={`orderItemInputs.${index}.product_id`}
                    {...register(`orderItemInputs.${index}.product_id` as const, {
                      required: "Product is required"
                    })}
                    placeholder="Select product"
                    size="sm"
                    onChange={(e) => {
                      // Handle immediate recalculation on product change
                      const currentItems = getValues("orderItemInputs");
                      const newProductId = e.target.value;
                      
                      // Immediately set the value in form state to ensure the UI updates
                      setValue(`orderItemInputs.${index}.product_id`, newProductId, shouldMarkDirty ? { shouldDirty: true } : undefined);
                      
                      if (currentItems && currentItems[index] && products?.data) {
                        // Find product and recalculate total
                        const product = products.data.find((p: any) => p.id === newProductId);
                        if (product?.unit_price) {
                          let newTotal = 0;
                          
                          // Calculate total from all items
                          currentItems.forEach((item: OrderItemInput, i: number) => {
                            // Use new product for the current item
                            const productId = i === index ? newProductId : item.product_id;
                            
                            if (productId && item.quantity > 0) {
                              const itemProduct = products.data.find((p: any) => p.id === productId);
                              if (itemProduct?.unit_price) {
                                // Convert to SGD before adding to total
                                const priceInSGD = convertToSGD(itemProduct.unit_price, itemProduct.price_currency);
                                newTotal += priceInSGD * item.quantity;
                              }
                            }
                          });
                          
                          // Only update if not manually edited
                          if (!manuallyEditedTotal) {
                            setValue("total_price", parseFloat(newTotal.toFixed(2)), shouldMarkDirty ? { shouldDirty: true } : undefined);
                          }
                        }
                      }
                    }}
                    {...editCustomerStyles.input}
                  >
                    {products?.data.map((product: any) => {
                      const isSelected = getSelectedProductIds(fields, getValues, index).has(product.id!);
                      const priceDisplay = product.unit_price 
                        ? ` - ${getCurrencySymbol(product.price_currency)}${product.unit_price.toFixed(2)}`
                        : '';
                      return (
                        <option 
                          key={product.id} 
                          value={product.id}
                          disabled={isSelected}
                        >
                          {product.id}{priceDisplay} {isSelected ? "(Already in order)" : ""}
                        </option>
                      );
                    })}
                  </Select>
                  {errors.orderItemInputs?.[index]?.product_id && (
                    <FormErrorMessage fontSize="xs">
                      {errors.orderItemInputs[index]?.product_id?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isInvalid={!!errors.orderItemInputs?.[index]?.quantity} size="sm">
                  <FormLabel htmlFor={`orderItemInputs.${index}.quantity`} fontSize="xs" mb={1}>Quantity</FormLabel>
                  <Input
                    id={`orderItemInputs.${index}.quantity`}
                    {...register(`orderItemInputs.${index}.quantity` as const, {
                      required: "Required",
                      min: { value: 1, message: "Min 1" },
                      valueAsNumber: true
                    })}
                    type="number"
                    placeholder="Qty"
                    size="sm"
                    onChange={(e) => {
                      // Handle immediate recalculation on quantity change
                      const currentItems = getValues("orderItemInputs");
                      const newQuantity = parseInt(e.target.value) || 0;
                      
                      // Immediately set the value in form state to ensure the UI updates
                      setValue(`orderItemInputs.${index}.quantity`, newQuantity, shouldMarkDirty ? { shouldDirty: true } : undefined);
                      
                      if (currentItems && currentItems[index] && !manuallyEditedTotal) {
                        const productId = currentItems[index].product_id;
                        
                        if (productId && newQuantity > 0 && products?.data) {
                          // Find product and recalculate total
                          const product = products.data.find((p: any) => p.id === productId);
                          if (product?.unit_price) {
                            let newTotal = 0;
                            
                            // Calculate total from all items
                            currentItems.forEach((item: OrderItemInput, i: number) => {
                              if (item.product_id && item.quantity > 0) {
                                const itemProduct = products.data.find((p: any) => p.id === item.product_id);
                                // Use new quantity for the current item
                                const qty = i === index ? newQuantity : item.quantity;
                                if (itemProduct?.unit_price) {
                                  // Convert to SGD before adding to total
                                  const priceInSGD = convertToSGD(itemProduct.unit_price, itemProduct.price_currency);
                                  newTotal += priceInSGD * qty;
                                }
                              }
                            });
                            
                            // Update total price field if not manually edited
                            if (!manuallyEditedTotal) {
                              setValue("total_price", parseFloat(newTotal.toFixed(2)), shouldMarkDirty ? { shouldDirty: true } : undefined);
                            }
                          }
                        }
                      }
                    }}
                    {...editCustomerStyles.input}
                  />
                  {errors.orderItemInputs?.[index]?.quantity && (
                    <FormErrorMessage fontSize="xs">
                      {errors.orderItemInputs[index]?.quantity?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </GridItem>
            </SimpleGrid>
            
            {/* Show item subtotal if product is selected */}
            {orderItemInputs[index]?.product_id && orderItemInputs[index]?.quantity > 0 && (
              <Box mt={2}>
                <HStack spacing={1} justifyContent="flex-end">
                  <Text fontSize="xs" color="gray.600">Item subtotal:</Text>
                  <Text fontSize="xs" fontWeight="bold" color="green.600">
                    {calculateItemSubtotal(orderItemInputs[index].product_id, orderItemInputs[index].quantity)}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => append({ product_id: "", quantity: 1 })}
          size="sm"
          colorScheme="blue"
          variant="ghost"
          width="auto"
          alignSelf="flex-start"
        >
          Add Product
        </Button>
      </VStack>
    </Box>
  );
};

export default OrderItemsField; 