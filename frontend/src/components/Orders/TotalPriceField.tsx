import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text
} from "@chakra-ui/react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { editCustomerStyles } from "../../styles/customers.styles";

interface TotalPriceFieldProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  errors: any;
  setValue: UseFormSetValue<any>;
  showTotalAnimation: boolean;
  manuallyEditedTotal: boolean;
  setManuallyEditedTotal: (value: boolean) => void;
  validationRules?: any;
  shouldMarkDirty?: boolean;
}

/**
 * Reusable component for the total price field with animation and manual edit tracking
 */
const TotalPriceField = ({
  id,
  label,
  register,
  errors,
  setValue,
  showTotalAnimation,
  manuallyEditedTotal,
  setManuallyEditedTotal,
  validationRules,
  shouldMarkDirty = false
}: TotalPriceFieldProps) => {
  return (
    <FormControl 
      isRequired={true}
      isInvalid={!!errors[id]}
    >
      <Box {...editCustomerStyles.formBox}>
        <FormLabel 
          htmlFor={id}
          {...editCustomerStyles.formLabel}
        >
          {label}
          <Text as="span" color="red.500" ml={1}></Text>
        </FormLabel>
        <Flex>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            bg="gray.100" 
            px={3} 
            borderWidth="1px" 
            borderRight="none"
            borderColor={showTotalAnimation ? "#48BB78" : "inherit"}
            borderRadius="md" 
            borderRightRadius="0"
            fontWeight="bold"
          >
            S$
          </Box>
          <Input
            id={id}
            {...register(id, validationRules || {
              required: "Total price is required",
              min: { value: 0, message: "Price cannot be negative" }
            })}
            placeholder="Enter total price"
            type="number"
            step="0.01"
            readOnly={false}
            borderLeftRadius="0"
            style={{ 
              backgroundColor: "#FFFFFF", 
              ...(showTotalAnimation ? {
                borderColor: "#48BB78",
                boxShadow: "0 0 0 1px #48BB78"
              } : {})
            }}
            onChange={(e) => {
              // Set the flag to indicate manual edit
              setManuallyEditedTotal(true);
              // Log the new value for debugging
              console.log("Manual price edit:", e.target.value);
            }}
            onBlur={(e) => {
              // When focus leaves the field, update the form value
              const newTotal = parseFloat(e.target.value);
              if (!isNaN(newTotal)) {
                // Ensure React Hook Form knows about the change
                setValue(id, newTotal, shouldMarkDirty ? { shouldDirty: true } : undefined);
              }
            }}
            {...editCustomerStyles.input}
          />
        </Flex>
        <Text 
          fontSize="xs" 
          color={showTotalAnimation ? "green.500" : (manuallyEditedTotal ? "blue.500" : "gray.500")} 
          fontWeight={showTotalAnimation || manuallyEditedTotal ? "medium" : "normal"}
          transition="all 0.3s"
          mt={1}
        >
          {manuallyEditedTotal 
            ? "Manually edited (automatic calculation paused)" 
            : "Auto-calculated but can be manually edited if needed"}
        </Text>
        {errors[id] && (
          <FormErrorMessage>
            {errors[id]?.message}
          </FormErrorMessage>
        )}
      </Box>
    </FormControl>
  );
};

export default TotalPriceField; 