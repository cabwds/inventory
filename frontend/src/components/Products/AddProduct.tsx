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
  };
  options?: Array<{ value: string; label: string }>;
}

interface FormSection {
  section: string;
  fields: FormField[];
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
]

const PRODUCT_TYPE_OPTIONS = [
  { value: "Standard", label: "Standard" },
  { value: "Custom", label: "Custom" },
  { value: "Prototype", label: "Prototype" },
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
      price_currency: "USD",
      cost_currency: "USD",
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
      queryClient.invalidateQueries({ queryKey: ["Products"] })
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
          id: "brand",
          label: "Brand",
          required: true,
          placeholder: "Enter brand name",
          validation: {
            required: "Brand is required",
          }
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
          label: "Width",
          placeholder: "Enter width",
          type: "number"
        },
        {
          id: "length",
          label: "Length",
          placeholder: "Enter length",
          type: "number"
        },
        {
          id: "thickness",
          label: "Thickness",
          placeholder: "Enter thickness",
          type: "number"
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
                          <NumberInput>
                            <NumberInputField
                              id={field.id}
                              {...register(field.id, field.validation)}
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
