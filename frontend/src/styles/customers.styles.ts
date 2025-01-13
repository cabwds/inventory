import { css } from "@emotion/react"

export const modalScrollbarStyles = css`
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`

export const customerDetailsStyles = {
  modalHeader: {
    borderBottom: "1px",
    borderColor: "gray.200",
    pb: 4,
    bg: "gray.50",
    borderTopRadius: "md"
  },

  sectionTitle: {
    fontSize: "md",
    fontWeight: "bold",
    color: "blue.600",
    mb: 4,
    pb: 2,
    borderBottom: "2px",
    borderColor: "blue.100"
  },

  detailBox: {
    p: 4,
    borderRadius: "md",
    borderWidth: "1px",
    borderColor: "gray.200",
    bg: "white",
    _hover: {
      bg: "gray.50",
      borderColor: "gray.300",
      transform: "translateY(-1px)",
      boxShadow: "sm"
    },
    transition: "all 0.2s"
  },

  tableContainer: {
    borderWidth: "1px",
    borderRadius: "lg",
    borderColor: "gray.200",
    shadow: "sm"
  },

  customerIdCell: {
    isTruncated: true,
    maxWidth: "50px",
    cursor: "pointer",
    color: "blue.500",
    _hover: { 
      color: "blue.600", 
      textDecoration: "underline" 
    },
    fontWeight: "medium"
  }
} 

export const editCustomerStyles = {
  modalHeader: {
    borderBottom: "1px",
    borderColor: "gray.200",
    pb: 4,
    bg: "gray.50",
    borderTopRadius: "md"
  },

  sectionTitle: {
    fontSize: "md",
    fontWeight: "bold",
    color: "blue.600",
    mb: 4,
    pb: 2,
    borderBottom: "2px",
    borderColor: "blue.100"
  },

  formBox: {
    p: 4,
    borderRadius: "md",
    borderWidth: "1px",
    borderColor: "gray.200",
    bg: "white",
    _hover: { 
      borderColor: "gray.300",
      transform: "translateY(-1px)",
      boxShadow: "sm"
    },
    transition: "all 0.2s"
  },

  formLabel: {
    fontSize: "sm",
    color: "gray.600",
    fontWeight: "medium",
    mb: 2
  },

  input: {
    bg: "white",
    borderColor: "gray.300",
    _hover: { borderColor: "gray.400" },
    _focus: { 
      borderColor: "blue.400",
      boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
    }
  },

  modalFooter: {
    borderTop: "1px",
    borderColor: "gray.200",
    gap: 3
  }
} 