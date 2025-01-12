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

import { type ApiError, type CustomerCreate, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"

interface AddCustomerProps {
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
  };
  options?: Array<{ value: string; label: string }>;
}

interface FormSection {
  section: string;
  fields: FormField[];
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" }
]

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Chinese", label: "Chinese" },
]

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
          required: true,
          placeholder: "Enter email address",
          type: "email",
          validation: {
            required: "Email is required",
          }
        },
        {
          id: "phone",
          label: "Phone",
          required: true,
          placeholder: "Enter phone number",
          validation: {
            required: "Phone number is required",
          }
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
                        isInvalid={!!errors[field.id as keyof CustomerCreate]}
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
                              {...register(field.id as keyof CustomerCreate, field.validation)}
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
                              {...register(field.id as keyof CustomerCreate, field.validation)}
                              placeholder={field.placeholder}
                              type={field.type || "text"}
                              {...editCustomerStyles.input}
                            />
                          )}
                          {errors[field.id as keyof CustomerCreate] && (
                            <FormErrorMessage>
                              {errors[field.id as keyof CustomerCreate]?.message}
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
