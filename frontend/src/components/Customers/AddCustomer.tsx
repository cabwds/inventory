import React from 'react'
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
      id: "",
      description: "",
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
      queryClient.invalidateQueries({ queryKey: ["Customers"] })
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
            <FormControl isRequired isInvalid={!!errors.id}>
              <FormLabel htmlFor="title">Id</FormLabel>
              <Input
                id="id"
                {...register("id", {
                  required: "Id is required.",
                })}
                placeholder="Id"
                type="text"
              />
              {errors.id && (
                <FormErrorMessage>{errors.id.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                id="description"
                {...register("description")}
                placeholder="Description"
                type="text"
              />
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
