import React from "react"
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

import {
  type ApiError,
  type ProductPublic,
  type ProductUpdate,
  ProductsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditProductProps {
  product: ProductPublic
  isOpen: boolean
  onClose: () => void
}

interface FormField {
  id: keyof ProductUpdate;
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

const CURRENCY_OPTIONS = [
  { value: "SGD", label: "SGD" },
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

const EditProduct = ({ product, isOpen, onClose }: EditProductProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<ProductUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: product,
  })

  const mutation = useMutation({
    mutationFn: (data: ProductUpdate) =>
      ProductsService.updateProduct({ id: product.id!, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Product updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const onSubmit: SubmitHandler<ProductUpdate> = async (data) => {
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
        },
        {
          id: "length",
          label: "Length (m)",
          placeholder: "50",
          type: "number",
        },
        {
          id: "thickness",
          label: "Thickness (mm)",
          placeholder: "0.18",
          type: "number",
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
          <Text fontSize="xl">Edit Product</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {product.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={8} overflowY="auto">
          <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)}>
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
            form="edit-product-form"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
            colorScheme="blue"
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

export default EditProduct
