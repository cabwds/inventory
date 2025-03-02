import React from "react";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";
import { FormSection } from "../../utils/customerTypes";
import { getCustomerFormSections } from "../../utils/customerFormUtils";
import { editCustomerStyles } from "../../styles/customers.styles";

interface CustomerFormFieldsProps {
  register: UseFormRegister<any>;
  errors: any;
  sections: FormSection[];
}

/**
 * Reusable component for rendering customer form fields across Add and Edit forms
 */
const CustomerFormFields: React.FC<CustomerFormFieldsProps> = ({
  register,
  errors,
  sections,
}) => {
  return (
    <>
      {sections.map((section) => (
        <Box key={section.section}>
          <Text {...editCustomerStyles.sectionTitle}>
            {section.section}
          </Text>
          <VStack spacing={4} align="stretch">
            {section.fields.map((field) => (
              <FormControl 
                key={field.id} 
                isRequired={field.required}
                isInvalid={!!errors[field.id]}
              >
                <Box {...editCustomerStyles.formBox}>
                  <FormLabel 
                    htmlFor={field.id}
                    {...editCustomerStyles.formLabel}
                  >
                    {field.label}
                  </FormLabel>
                  
                  {field.type === "custom" && field.component ? (
                    field.component
                  ) : field.type === "select" ? (
                    <Select
                      id={field.id}
                      {...register(field.id as string, field.validation)}
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
                      {...register(field.id as string, field.validation)}
                      placeholder={field.placeholder}
                      type={field.type || "text"}
                      {...editCustomerStyles.input}
                    />
                  )}
                  
                  {errors[field.id] && (
                    <FormErrorMessage>
                      {errors[field.id]?.message}
                    </FormErrorMessage>
                  )}
                </Box>
              </FormControl>
            ))}
          </VStack>
        </Box>
      ))}
    </>
  );
};

/**
 * Returns the default customer form sections configuration
 */
export const getDefaultCustomerFormSections = (isEditMode: boolean = false): FormSection[] => {
  return getCustomerFormSections(isEditMode);
};

export default CustomerFormFields; 