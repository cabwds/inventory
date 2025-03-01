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
  HStack,
  IconButton,
  Flex,
  Divider,
  GridItem,
} from "@chakra-ui/react"
import { AddIcon, DeleteIcon } from "@chakra-ui/icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm, Controller, useFieldArray } from "react-hook-form"
import { useState, useEffect } from "react"

import { type ApiError, type OrderCreate, OrdersService, CustomersService, ProductsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"

interface AddOrderProps {
  isOpen: boolean
  onClose: () => void
}

interface FormField {
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

interface FormSection {
  section: string;
  fields: FormField[];
}

interface OrderItemInput {
  product_id: string;
  quantity: number;
}

interface OrderFormData extends OrderCreate {
  orderItemInputs: OrderItemInput[];
}

const ORDER_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
]

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderItemInputs",
  });

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

  const onSubmit: SubmitHandler<OrderFormData> = (data) => {
    // Convert orderItemInputs to order_items JSON string
    const orderItemsObject: Record<string, number> = {};
    data.orderItemInputs.forEach(item => {
      if (item.product_id && item.quantity > 0) {
        orderItemsObject[item.product_id] = item.quantity;
      }
    });

    mutation.mutate({
      ...data,
      order_items: JSON.stringify(orderItemsObject),
      total_price: Number(data.total_price),
      order_date: new Date().toISOString(),
    })
  }

  const formSections: FormSection[] = [
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
          label: "Total Price",
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
  ]

  // Replace the order_items field in the formSections
  const updatedFormSections = formSections.map(section => {
    if (section.section === "Basic Information") {
      // Filter out order_items and order_quantity fields
      const updatedFields = section.fields.filter(
        field => field.id !== "order_items" && field.id !== "order_quantity"
      );
      return {
        ...section,
        fields: updatedFields
      };
    }
    return section;
  });

  // Get the set of already selected product IDs
  const getSelectedProductIds = (currentIndex: number) => {
    return new Set(
      fields
        .map((field, idx) => idx !== currentIndex ? getValues(`orderItemInputs.${idx}.product_id`) : null)
        .filter(id => id !== null && id !== "")
    );
  };

  // Filter out already selected products
  const getAvailableProducts = (currentIndex: number) => {
    if (!products?.data) return [];
    
    // Get all product_ids that are already selected in other items
    const selectedProductIds = fields
      .map((field, idx) => idx !== currentIndex ? getValues(`orderItemInputs.${idx}.product_id`) : null)
      .filter(id => id !== null && id !== "");
    
    // Return only products that aren't already selected
    return products.data.filter(product => !selectedProductIds.includes(product.id!));
  };

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
                  </VStack>
                </Box>
              ))}

              {/* Order Items Section */}
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
                              {...editCustomerStyles.input}
                            >
                              {products?.data.map((product) => {
                                const isSelected = getSelectedProductIds(index).has(product.id!);
                                return (
                                  <option 
                                    key={product.id} 
                                    value={product.id}
                                    disabled={isSelected}
                                  >
                                    {product.id} {isSelected ? "(Already in order)" : ""}
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
