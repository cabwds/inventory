import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Box,
  SimpleGrid,
} from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CustomersService } from "../../../client"
import useCustomToast from "../../../hooks/useCustomToast"
import { modalScrollbarStyles, customerDetailsStyles } from "../../../styles/customers.styles"

export const Route = createFileRoute('/_layout/customers/$customerId')({
  component: CustomerDetail,
})

function CustomerDetail() {
  const { customerId } = Route.useParams()
  const navigate = useNavigate()
  const showToast = useCustomToast()

  const { data: customer, isError } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => CustomersService.readCustomer({ id: customerId }),
  })

  if (isError) {
    showToast("Error", "Failed to load customer details", "error")
  }

  const customerDetails = [
    {
      section: "Basic Information",
      items: [
        { label: "Company", value: customer?.company },
        { label: "Full Name", value: customer?.full_name },
        { label: "Gender", value: customer?.gender },
        { label: "Preferred Language", value: customer?.preferred_language }
      ]
    },
    {
      section: "Contact Details",
      items: [
        { label: "Email", value: customer?.email },
        { label: "Phone", value: customer?.phone },
        { label: "Address", value: customer?.address }
      ]
    },
    {
      section: "Additional Information",
      items: [
        { label: "Description", value: customer?.description },
        { label: "Order List", value: customer?.order_ids }
      ]
    }
  ]

  return (
    <Modal 
      isOpen={true}
      onClose={() => navigate({ to: '/customers' })}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader {...customerDetailsStyles.modalHeader}>
          <Text fontSize="xl">Customer Details</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {customer?.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          {customer && (
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {customerDetails.map((section) => (
                <Box key={section.section}>
                  <Text {...customerDetailsStyles.sectionTitle}>
                    {section.section}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {section.items.map(({ label, value }) => (
                      <Box 
                        key={label} 
                        {...customerDetailsStyles.detailBox}
                      >
                        <Text 
                          fontSize="sm" 
                          color="gray.600" 
                          mb={1}
                          fontWeight="medium"
                        >
                          {label}
                        </Text>
                        <Text 
                          fontSize="md"
                          fontWeight={value ? "medium" : "normal"}
                          color={value ? "black" : "gray.400"}
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {value || 'N/A'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 