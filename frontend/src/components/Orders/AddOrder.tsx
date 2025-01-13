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
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type OrderCreate, OrdersService, CustomersService } from "../../client"
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
    formState: { errors, isSubmitting },
  } = useForm<OrderCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      customer_id: "",
      order_status: "Pending",
      payment_status: "Pending",
      total_price: 0,
      is_valid: true,
    },
  })

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers({ limit: 100 }),
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

  const onSubmit: SubmitHandler<OrderCreate> = (data) => {
    mutation.mutate({
      ...data,
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
          id: "order_items",
          label: "Order Items",
          placeholder: "Enter order items",
          type: "textarea"
        },
        {
          id: "order_quantity",
          label: "Order Quantity",
          placeholder: "Enter order quantity"
        }
      ]
    },
    {
      section: "Order Details",
      fields: [
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
        },
        {
          id: "is_valid",
          label: "Is Valid",
          type: "select",
          placeholder: "Yes?",
          options: [
            { value: "true", label: "Yes" },
            { value: "false", label: "No" }
          ]
        }
      ]
    }
  ]

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
              {formSections.map((section) => (
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
