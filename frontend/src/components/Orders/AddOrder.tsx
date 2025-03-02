import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Box,
  VStack,
  Select,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"
import { useState, useEffect } from "react"

import { type ApiError, type OrderCreate, OrdersService, CustomersService, ProductsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"

// Import shared utilities and components
import { convertToSGD } from "../../utils/currencyUtils"
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "../../utils/orderConstants"
import { OrderItemInput, parseOrderItems } from "./orderTypes"
import { getOrderFormSections, processFormSections } from "./orderFormUtils"
import OrderItemsField from "./OrderItemsField"
import TotalPriceField from "./TotalPriceField"

interface AddOrderProps {
  isOpen: boolean
  onClose: () => void
}

interface OrderFormData extends OrderCreate {
  orderItemInputs: OrderItemInput[];
}

const AddOrder = ({ isOpen, onClose }: AddOrderProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    watch,
  } = useForm<OrderFormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      customer_id: "",
      order_status: "Pending",
      payment_status: "Pending",
      total_price: 0,
      is_valid: true,
      orderItemInputs: [{ product_id: "", quantity: 1 }]
    },
  })

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers({ limit: 100 }),
  })

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductsService.readProducts({ limit: 100 }),
  })

  const mutation = useMutation({
    mutationFn: (data: OrderCreate) =>
      OrdersService.createOrder({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Order created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  // Watch for changes to orderItemInputs to recalculate total price
  const orderItemInputs = watch("orderItemInputs");
  const [previousTotal, setPreviousTotal] = useState<number>(0);
  const [showTotalAnimation, setShowTotalAnimation] = useState<boolean>(false);
  const [manuallyEditedTotal, setManuallyEditedTotal] = useState<boolean>(false);

  // Calculate total price based on selected products and quantities
  useEffect(() => {
    if (!products?.data) return;
    
    // Skip auto-calculation if the user has manually edited the total
    if (manuallyEditedTotal) return;

    // Create a separate calculation function to avoid dependency issues
    const calculateTotal = () => {
      // Get the most current values directly from getValues
      const currentItems = getValues("orderItemInputs");
      
      let calculatedTotalPrice = 0;
      
      if (currentItems && currentItems.length > 0) {
        currentItems.forEach(item => {
          if (item.product_id && item.quantity > 0) {
            // Find the product in products data
            const product = products.data.find(p => p.id === item.product_id);
            if (product && product.unit_price) {
              // Convert price to SGD first, then add to total
              const priceInSGD = convertToSGD(product.unit_price, product.price_currency);
              calculatedTotalPrice += priceInSGD * item.quantity;
            }
          }
        });
      }
      
      return parseFloat(calculatedTotalPrice.toFixed(2));
    };
    
    // Calculate the new total
    const newTotal = calculateTotal();
    
    // Only update if the total has actually changed to avoid infinite loops
    if (newTotal !== previousTotal) {
      // Update the form value first
      setValue("total_price", newTotal);
      // Then update state for animation
      setPreviousTotal(newTotal);
      setShowTotalAnimation(true);
      
      // Reset animation after a short delay
      const timer = setTimeout(() => {
        setShowTotalAnimation(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [orderItemInputs, products?.data, setValue, previousTotal, getValues, manuallyEditedTotal]);

  const onSubmit: SubmitHandler<OrderFormData> = (data) => {
    // Convert orderItemInputs to order_items JSON string
    const orderItemsObject: Record<string, number> = {};
    data.orderItemInputs.forEach(item => {
      if (item.product_id && item.quantity > 0) {
        orderItemsObject[item.product_id] = item.quantity;
      }
    });

    // Get the final total price from the form data - this is what the user has entered
    // or what was auto-calculated if they didn't manually edit
    let finalTotal = data.total_price;
    
    // If we haven't manually edited, recalculate to ensure accuracy
    if (!manuallyEditedTotal) {
      let recalculatedTotal = 0;
      console.log('Recalculating order total in SGD:');
      
      data.orderItemInputs.forEach(item => {
        if (item.product_id && item.quantity > 0) {
          const product = products?.data.find(p => p.id === item.product_id);
          if (product?.unit_price) {
            // Convert price to SGD first
            const priceInSGD = convertToSGD(product.unit_price, product.price_currency);
            const itemTotal = priceInSGD * item.quantity;
            recalculatedTotal += itemTotal;
            
            console.log(`Product: ${product.id}, Qty: ${item.quantity}, Original: ${product.price_currency} ${product.unit_price}, In SGD: S$${priceInSGD.toFixed(2)}, Item Total: S$${itemTotal.toFixed(2)}`);
          }
        }
      });
      
      finalTotal = Number(recalculatedTotal.toFixed(2));
      console.log(`Recalculated total: S$${finalTotal}`);
    }
    
    // For debugging only - can be removed in production
    console.log('Form total price value:', data.total_price);
    console.log('Final total being submitted:', finalTotal);
    console.log('Using manually edited price:', manuallyEditedTotal);
    console.log('Order items:', data.orderItemInputs);

    // Submit the actual data
    try {
      mutation.mutate({
        ...data,
        order_items: JSON.stringify(orderItemsObject),
        // Always use finalTotal which is either manually edited or recalculated
        total_price: finalTotal,
        order_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast("Error", "Failed to create order. See console for details.", "error");
    }
  }

  // Get form sections from shared utility
  const formSections = getOrderFormSections();
  const updatedFormSections = processFormSections(formSections);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader {...editCustomerStyles.modalHeader}>
          <Text fontSize="xl">Add Order</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          <form id="add-order-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {updatedFormSections.map((section) => (
                <Box key={section.section}>
                  <Text {...editCustomerStyles.sectionTitle}>
                    {section.section}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {section.fields.map((field) => (
                      <FormControl 
                        key={field.id} 
                        isRequired={field.required}
                        isInvalid={!!errors[field.id as keyof OrderCreate]}
                      >
                        <Box {...editCustomerStyles.formBox}>
                          <FormLabel 
                            htmlFor={field.id}
                            {...editCustomerStyles.formLabel}
                          >
                            {field.label}
                            {field.required && 
                              <Text as="span" color="red.500" ml={1}></Text>
                            }
                          </FormLabel>
                          {field.id === "customer_id" ? (
                            <Select
                              id={field.id}
                              {...register(field.id as keyof OrderCreate, field.validation)}
                              placeholder={field.placeholder}
                              {...editCustomerStyles.input}
                            >
                              {customers?.data.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                  {customer.company}
                                </option>
                              ))}
                            </Select>
                          ) : field.type === "select" ? (
                            <Select
                              id={field.id}
                              {...register(field.id as keyof OrderCreate, field.validation)}
                              placeholder={field.placeholder}
                              {...editCustomerStyles.input}
                            >
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          ) : field.type === "textarea" ? (
                            <Textarea
                              id={field.id}
                              {...register(field.id as keyof OrderCreate, field.validation)}
                              placeholder={field.placeholder}
                              {...editCustomerStyles.input}
                            />
                          ) : (
                            <Input
                              id={field.id}
                              {...register(field.id as keyof OrderCreate, field.validation)}
                              placeholder={field.placeholder}
                              type={field.type || "text"}
                              {...editCustomerStyles.input}
                            />
                          )}
                          {errors[field.id as keyof OrderCreate] && (
                            <FormErrorMessage>
                              {errors[field.id as keyof OrderCreate]?.message}
                            </FormErrorMessage>
                          )}
                        </Box>
                      </FormControl>
                    ))}

                    {/* Add TotalPriceField as a separate field after the section fields */}
                    {section.section === "Basic Information" && (
                      <FormControl 
                        isRequired={true}
                        isInvalid={!!errors.total_price}
                      >
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
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              ))}

              {/* Order Items Section - Use the shared component */}
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
            </SimpleGrid>
          </form>
        </ModalBody>

        <ModalFooter {...editCustomerStyles.modalFooter}>
          <Button
            variant="primary"
            type="submit"
            form="add-order-form"
            isLoading={isSubmitting}
            colorScheme="blue"
            px={6}
          >
            Save
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddOrder
