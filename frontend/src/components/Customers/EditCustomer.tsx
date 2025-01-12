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
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"

interface EditCustomerProps {
  customer: CustomerPublic
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
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
  };
  options?: Array<{ value: string; label: string }>;
}

interface FormSection {
  section: string;
  fields: FormField[];
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" }
]

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Chinese", label: "Chinese" },
]

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

  const formSections: FormSection[] = [
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
          placeholder: "Select gender",
          type: "select",
          options: GENDER_OPTIONS
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
          placeholder: "Select preferred language",
          type: "select",
          options: LANGUAGE_OPTIONS
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
        <ModalHeader {...editCustomerStyles.modalHeader}>
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
          css={modalScrollbarStyles}
        >
          <form id="edit-customer-form" onSubmit={handleSubmit(onSubmit)}>
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
                        isInvalid={!!errors[field.id as keyof CustomerUpdate]}
                      >
                        <Box {...editCustomerStyles.formBox}>
                          <FormLabel 
                            htmlFor={field.id}
                            {...editCustomerStyles.formLabel}
                          >
                            {field.label}
                            {field.required && 
                              <Text as="span" color="red.500" ml={1}>*</Text>
                            }
                          </FormLabel>
                          {field.type === "select" ? (
                            <Select
                              id={field.id}
                              {...register(field.id as keyof CustomerUpdate, field.validation)}
                              placeholder={field.placeholder}
                              {...editCustomerStyles.input}
                            >
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              id={field.id}
                              {...register(field.id as keyof CustomerUpdate, field.validation)}
                              placeholder={field.placeholder}
                              type={field.type || "text"}
                              {...editCustomerStyles.input}
                            />
                          )}
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
        <ModalFooter {...editCustomerStyles.modalFooter}>
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
