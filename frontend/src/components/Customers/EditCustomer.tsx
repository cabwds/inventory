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
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type CustomerPublic,
  type CustomerUpdate,
  CustomersService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditCustomerProps {
  customer: CustomerPublic
  isOpen: boolean
  onClose: () => void
}

const EditCustomer = ({ customer, isOpen, onClose }: EditCustomerProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<CustomerUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: customer,
  })

  const mutation = useMutation({
    mutationFn: (data: CustomerUpdate) =>
      CustomersService.updateCustomer({ id: customer.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Customer updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const onSubmit: SubmitHandler<CustomerUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  const formSections = [
    {
      section: "Basic Information",
      fields: [
        {
          id: "company",
          label: "Company",
          required: true,
          placeholder: "Enter company name",
          validation: {
            required: "Company name is required",
          }
        },
        {
          id: "full_name",
          label: "Full Name",
          placeholder: "Enter full name"
        },
        {
          id: "gender",
          label: "Gender",
          placeholder: "Enter gender"
        }
      ]
    },
    {
      section: "Contact Details",
      fields: [
        {
          id: "email",
          label: "Email",
          placeholder: "Enter email address",
          type: "email"
        },
        {
          id: "phone",
          label: "Phone",
          placeholder: "Enter phone number"
        },
        {
          id: "address",
          label: "Address",
          placeholder: "Enter address"
        }
      ]
    },
    {
      section: "Additional Information",
      fields: [
        {
          id: "preferred_language",
          label: "Preferred Language",
          placeholder: "Enter preferred language"
        },
        {
          id: "description",
          label: "Description",
          placeholder: "Enter description"
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
        <ModalHeader 
          borderBottom="1px" 
          borderColor="gray.200"
          pb={4}
          bg="gray.50"
          borderTopRadius="md"
        >
          <Text fontSize="xl">Edit Customer</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {customer.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e0',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a0aec0',
            },
          }}
        >
          <form id="edit-customer-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {formSections.map((section) => (
                <Box key={section.section}>
                  <Text 
                    fontSize="md" 
                    fontWeight="bold" 
                    color="blue.600" 
                    mb={4}
                    pb={2}
                    borderBottom="2px"
                    borderColor="blue.100"
                  >
                    {section.section}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {section.fields.map((field) => (
                      <FormControl 
                        key={field.id} 
                        isInvalid={!!errors[field.id as keyof CustomerUpdate]}
                      >
                        <Box
                          p={4}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="gray.200"
                          bg="white"
                          _hover={{ 
                            borderColor: "gray.300",
                            transform: "translateY(-1px)",
                            boxShadow: "sm"
                          }}
                          transition="all 0.2s"
                        >
                          <FormLabel 
                            htmlFor={field.id}
                            fontSize="sm"
                            color="gray.600"
                            fontWeight="medium"
                            mb={2}
                          >
                            {field.label}
                            {field.required && 
                              <Text as="span" color="red.500" ml={1}>*</Text>
                            }
                          </FormLabel>
                          <Input
                            id={field.id}
                            {...register(field.id as keyof CustomerUpdate, field.validation)}
                            placeholder={field.placeholder}
                            type={field.type || "text"}
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ 
                              borderColor: "blue.400",
                              boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                            }}
                          />
                          {errors[field.id as keyof CustomerUpdate] && (
                            <FormErrorMessage>
                              {errors[field.id as keyof CustomerUpdate]?.message}
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
        <ModalFooter 
          borderTop="1px" 
          borderColor="gray.200"
          gap={3}
        >
          <Button
            variant="primary"
            type="submit"
            form="edit-customer-form"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
            colorScheme="blue"
            px={6}
          >
            Save Changes
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditCustomer
