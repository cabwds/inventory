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
  Button,
  Flex,
  Link,
  Icon,
  Avatar,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CustomersService, OrdersService } from "../../../client"
import useCustomToast from "../../../hooks/useCustomToast"
import { modalScrollbarStyles, customerDetailsStyles } from "../../../styles/customers.styles"
import { FaExternalLinkAlt } from "react-icons/fa"
import { FiUser } from "react-icons/fi"
import { formatCustomerData } from "../../../utils/customerFormUtils"

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

  const { data: orderCount } = useQuery({
    queryKey: ['customerOrderCount', customerId],
    queryFn: () => OrdersService.readCustomerOrdersCount({ customerId }),
  })

  const { data: profileImage, isLoading: isLoadingImage, isError: isErrorLoadingImage } = useQuery({
    queryKey: ['customerProfileImage', customerId],
    queryFn: () => CustomersService.getProfileImage({ customerId }),
    enabled: !!customerId,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    }
  })

  if (isError) {
    showToast("Error", "Failed to load customer details", "error")
  }

  // Format customer data for display
  const formattedData = customer ? formatCustomerData(customer) : null;

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
        { 
          label: "Total Orders", 
          value: (
            <Flex align="center" gap={3}>
              <Text as="span" fontWeight="medium">
                {orderCount?.count ?? 'N/A'}
              </Text>
              {orderCount?.count != null && orderCount.count > 0 && (
                <Button
                  as={Link}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  rightIcon={<Icon as={FaExternalLinkAlt} boxSize="12px" />}
                  href={`/orders?customerId=${customerId}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate({ to: '/orders', search: { customerId } })
                  }}
                  _hover={{
                    textDecoration: 'none',
                    bg: 'blue.50'
                  }}
                >
                  View Orders
                </Button>
              )}
            </Flex>
          )
        }
      ]
    }
  ]

  return (
    <Modal 
      isOpen={true}
      onClose={() => window.history.back()}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent 
        maxH="85vh"
        bg={customer?.is_valid === false ? "red.50" : "white"}
      >
        <ModalHeader {...customerDetailsStyles.modalHeader}>
          <Flex justify="space-between" align="center" width="100%">
            <Box>
              <Text fontSize="xl">
                Customer Details
                {customer?.is_valid === false && (
                  <Text
                    as="span"
                    color="red.500"
                    fontSize="md"
                    ml={2}
                  >
                    (INVALID)
                  </Text>
                )}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                ID: {customer?.id}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          {customer && (
            <VStack spacing={8} align="stretch">
              {customer.is_valid === false && (
                <Alert 
                  status="error"
                  variant="subtle"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Invalid Customer Record</AlertTitle>
                    <AlertDescription>
                      This customer has been marked as invalid. Some information may be unavailable.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <Flex justify="center" pt={2} pb={6}>
                {isLoadingImage ? (
                  <Spinner size="xl" thickness="4px" />
                ) : (
                  <Box>
                    <Avatar 
                      size="2xl"
                      src={!isErrorLoadingImage && profileImage ? `data:image/jpeg;base64,${profileImage}` : undefined}
                      bg={customer.is_valid === false ? "gray.300" : "gray.200"}
                      icon={<FiUser size="60%" />}
                      opacity={customer.is_valid === false ? 0.8 : 1}
                    />
                    <Text 
                      textAlign="center" 
                      mt={2} 
                      fontSize="lg" 
                      fontWeight="medium"
                      color={customer.is_valid === false ? "gray.600" : "inherit"}
                    >
                      {customer.full_name}
                    </Text>
                  </Box>
                )}
              </Flex>

              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                {customerDetails.map((section) => (
                  <Box 
                    key={section.section}
                    opacity={customer.is_valid === false ? 0.9 : 1}
                  >
                    <Text {...customerDetailsStyles.sectionTitle}>
                      {section.section}
                    </Text>
                    <VStack spacing={4} align="stretch">
                      {section.items.map(({ label, value }) => (
                        <Box 
                          key={label} 
                          {...customerDetailsStyles.detailBox}
                          bg={customer.is_valid === false ? "white" : "inherit"}
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
                            color={customer.is_valid === false 
                              ? (value ? "gray.700" : "gray.400")
                              : (value ? "black" : "gray.400")}
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
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 