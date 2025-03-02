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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type ProductCreate, ProductsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddProductProps {
  isOpen: boolean
  onClose: () => void
}

interface FormField {
  id: keyof ProductCreate;
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
    min?: {
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

const CURRENCY_OPTIONS = [
  { value: "SGD", label: "SGD" },
  { value: "CNY", label: "CNY" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
]

const PRODUCT_TYPE_OPTIONS = [
  { value: "Wood", label: "Wood" },
  { value: "Stone", label: "Stone" },
  { value: "Metal", label: "Metal" },
  { value: "Pure", label: "Pure" },
  { value: "Sensory", label: "Sensory" },
  { value: "Other", label: "Other" },
]

const BRAND_OPTIONS = [
  { value: "XFG", label: "XFG" },
  { value: "SuoLaiSi", label: "SuoLaiSi" },
  { value: "Other", label: "Other" },
]

const AddProduct = ({ isOpen, onClose }: AddProductProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      brand: "",
      type: "",
      price_currency: "SGD",
      cost_currency: "SGD",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProductCreate) =>
      ProductsService.createProduct({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Product created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const onSubmit: SubmitHandler<ProductCreate> = (data) => {
    mutation.mutate(data)
  }

  const formSections: FormSection[] = [
    {
      section: "Basic Information",
      fields: [
        {
          id: "id",
          label: "Product Name",
          required: true,
          placeholder: "Enter product name",
          validation: {
            required: "Product name is required",
          }
        },
        {
          id: "brand",
          label: "Brand",
          required: true,
          placeholder: "Enter brand name",
          validation: {
            required: "Brand is required",
          },
          type: "select",
          options: BRAND_OPTIONS
        },
        {
          id: "type",
          label: "Product Type",
          placeholder: "Select product type",
          type: "select",
          options: PRODUCT_TYPE_OPTIONS
        }
      ]
    },
    {
      section: "Pricing",
      fields: [
        {
          id: "unit_price",
          label: "Unit Price",
          required: true,
          placeholder: "Enter unit price",
          type: "number",
          validation: {
            required: "Unit price is required",
          }
        },
        {
          id: "price_currency",
          label: "Price Currency",
          placeholder: "Select currency",
          type: "select",
          options: CURRENCY_OPTIONS
        },
        {
          id: "unit_cost",
          label: "Unit Cost",
          placeholder: "Enter unit cost",
          type: "number"
        },
        {
          id: "cost_currency",
          label: "Cost Currency",
          placeholder: "Select currency",
          type: "select",
          options: CURRENCY_OPTIONS
        }
      ]
    },
    {
      section: "Dimensions",
      fields: [
        {
          id: "width",
          label: "Width (m)",
          placeholder: "1.2",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Width must be greater than 0"
            }
          }
        },
        {
          id: "length",
          label: "Length (m)",
          placeholder: "50",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Length must be greater than 0"
            }
          }
        },
        {
          id: "thickness",
          label: "Thickness (mm)",
          placeholder: "0.18",
          type: "number",
          validation: {
            min: {
              value: 0,
              message: "Thickness must be greater than 0"
            }
          }
        }
      ]
    }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "4xl" }}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader borderBottomWidth="1px">
          <Text fontSize="xl">Add Product</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={8} overflowY="auto">
          <form id="add-product-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {formSections.map((section) => (
                <Box key={section.section}>
                  <Text
                    fontSize="lg"
                    fontWeight="medium"
                    mb={4}
                    borderBottomWidth="1px"
                    pb={2}
                  >
                    {section.section}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {section.fields.map((field) => (
                      <FormControl 
                        key={field.id} 
                        isRequired={field.required}
                        isInvalid={!!errors[field.id]}
                      >
                        <FormLabel 
                          htmlFor={field.id}
                          fontWeight="medium"
                        >
                          {field.label}
                        </FormLabel>
                        
                        {field.type === "select" ? (
                          <Select
                            id={field.id}
                            {...register(field.id, field.validation)}
                            placeholder={field.placeholder}
                          >
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        ) : field.type === "number" ? (
                          <NumberInput
                            precision={field.id === "thickness" ? 3 : 2}
                            step={field.id === "thickness" ? 0.001 : 0.01}
                            min={0}
                          >
                            <NumberInputField
                              id={field.id}
                              {...register(field.id, {
                                valueAsNumber: true
                              })}
                              placeholder={field.placeholder}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        ) : (
                          <Input
                            id={field.id}
                            {...register(field.id, field.validation)}
                            placeholder={field.placeholder}
                            type={field.type || "text"}
                          />
                        )}
                        
                        {errors[field.id] && (
                          <FormErrorMessage>
                            {errors[field.id]?.message}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    ))}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </form>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" gap={3}>
          <Button
            variant="primary"
            type="submit"
            form="add-product-form"
            isLoading={isSubmitting}
            colorScheme="blue"
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

export default AddProduct
