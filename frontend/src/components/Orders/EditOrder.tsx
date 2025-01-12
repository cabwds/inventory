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
  Select,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type OrderPublic,
  type OrderUpdate,
  OrdersService,
  CustomersService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditOrderProps {
  order: OrderPublic
  isOpen: boolean
  onClose: () => void
}

const EditOrder = ({ order, isOpen, onClose }: EditOrderProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<OrderUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: order,
  })

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers({ limit: 100 }),
  })

  const mutation = useMutation({
    mutationFn: (data: OrderUpdate) =>
      OrdersService.updateOrder({ id: order.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Order updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const onSubmit: SubmitHandler<OrderUpdate> = async (data) => {
    mutation.mutate({
      ...data,
      total_price: Number(data.total_price),
    })
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Edit Order</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.customer_id}>
            <FormLabel htmlFor="customer_id">Customer</FormLabel>
            <Select
              id="customer_id"
              {...register("customer_id", {
                required: "Customer is required.",
              })}
            >
              <option value="">Select Customer</option>
              {customers?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company}
                </option>
              ))}
            </Select>
            {errors.customer_id && (
              <FormErrorMessage>{errors.customer_id.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.order_status}>
            <FormLabel htmlFor="status">Order Status</FormLabel>
            <Select
              id="status"
              {...register("order_status", {
                required: "Status is required.",
              })}
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
            {errors.order_status && (
              <FormErrorMessage>{errors.order_status.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.total_price}>
            <FormLabel htmlFor="total_price">Total Price</FormLabel>
            <Input
              id="total_price"
              {...register("total_price", {
                required: "Total price is required.",
                min: { value: 0, message: "Amount cannot be negative." },
              })}
              type="number"
              step="0.01"
            />
            {errors.total_price && (
              <FormErrorMessage>{errors.total_price.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
          >
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditOrder
