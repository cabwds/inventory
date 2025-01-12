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
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type CustomerCreate, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddCustomerProps {
  isOpen: boolean
  onClose: () => void
}

const AddCustomer = ({ isOpen, onClose }: AddCustomerProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      company: "",
      email: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CustomerCreate) =>
      CustomersService.createCustomer({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Customer created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const onSubmit: SubmitHandler<CustomerCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.company}>
              <FormLabel htmlFor="company">Company</FormLabel>
              <Input
                id="company"
                {...register("company", {
                  required: "Company is required.",
                })}
                placeholder="company"
                type="text"
              />
              {errors.company && (
                <FormErrorMessage>{errors.company.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required.",
                })}
                placeholder="email"
                type="text"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.phone}>
              <FormLabel htmlFor="phone">Phone</FormLabel>
              <Input
                id="phone"
                {...register("phone", {
                  required: "Phone number is required.",
                })}
                placeholder="phone"
                type="text"
              />
              {errors.phone && (
                <FormErrorMessage>{errors.phone.message}</FormErrorMessage>
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
    </>
  )
}

export default AddCustomer
