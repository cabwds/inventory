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

import { type ApiError, type OrderCreate, OrdersService, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddOrderProps {
  isOpen: boolean
  onClose: () => void
}

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
      total_price: 0,
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
    console.log('Submitting order data:', data);
    mutation.mutate({
      ...data,
      total_price: Number(data.total_price),
    })
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
        <ModalHeader>Add Order</ModalHeader>
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

          <FormControl mt={4}>
            <FormLabel htmlFor="order_status">Order Status</FormLabel>
            <Select
              id="order_status"
              {...register("order_status")}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.total_price}>
            <FormLabel htmlFor="total_price">Total Price</FormLabel>
            <Input
              id="total_price"
              {...register("total_price", {
                required: "Total amount is required.",
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
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddOrder
