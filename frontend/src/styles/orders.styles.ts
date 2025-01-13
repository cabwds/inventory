import { SystemStyleObject } from "@chakra-ui/react"

export const orderDetailsStyles = {
  modalHeader: {
    borderBottom: "1px solid",
    borderColor: "gray.200",
    pb: 4,
  } as SystemStyleObject,
  
  sectionTitle: {
    fontSize: "lg",
    fontWeight: "semibold",
    mb: 4,
    color: "gray.700",
  } as SystemStyleObject,
  
  detailBox: {
    p: 3,
    bg: "gray.50",
    borderRadius: "md",
  } as SystemStyleObject,
  
  tableContainer: {
    bg: "white",
    borderRadius: "lg",
    shadow: "sm",
    border: "1px solid",
    borderColor: "gray.200",
  } as SystemStyleObject,
}

export const modalScrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "gray.300",
    borderRadius: "24px",
  },
} 