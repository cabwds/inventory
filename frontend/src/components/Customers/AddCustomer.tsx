import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type CustomerCreate, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"
import CustomerFormFields, { getDefaultCustomerFormSections } from "./CustomerFormFields"

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
      phone: "",
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

  // Get form sections configuration (false for Add mode)
  const formSections = getDefaultCustomerFormSections(false);

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
          <Text fontSize="xl">Add Customer</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          <form id="add-customer-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              <CustomerFormFields
                register={register}
                errors={errors}
                sections={formSections}
              />
            </SimpleGrid>
          </form>
        </ModalBody>

        <ModalFooter {...editCustomerStyles.modalFooter}>
          <Button
            variant="primary"
            type="submit"
            form="add-customer-form"
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

export default AddCustomer
