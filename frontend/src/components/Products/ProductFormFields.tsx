import React from "react";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";
import { BRAND_OPTIONS, CURRENCY_OPTIONS, PRODUCT_TYPE_OPTIONS } from "../../utils/productConstants";
import { FormSection } from "../../utils/productTypes";

interface ProductFormFieldsProps {
  register: UseFormRegister<any>;
  errors: any;
  sections: FormSection[];
}

/**
 * Reusable component for rendering product form fields across Add and Edit forms
 */
const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  register,
  errors,
  sections,
}) => {
  return (
    <>
      {sections.map((section) => (
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
                        ...field.validation,
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
    </>
  );
};

/**
 * Returns the default product form sections configuration
 */
export const getDefaultProductFormSections = (isEditMode: boolean = false): FormSection[] => {
  const baseFormSections = [
    {
      section: "Basic Information",
      fields: [
        // Only include id field in add mode
        ...(isEditMode ? [] : [{
          id: "id",
          label: "Product Name",
          required: true,
          placeholder: "Enter product name",
          validation: {
            required: "Product name is required",
          }
        }]),
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
  ];

  // Filter out empty sections
  return baseFormSections.map(section => ({
    ...section,
    fields: section.fields.filter(field => field !== undefined)
  }));
};

export default ProductFormFields; 