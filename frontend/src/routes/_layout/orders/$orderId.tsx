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
import { OrdersService, CustomersService } from "../../../client"
import useCustomToast from "../../../hooks/useCustomToast"
import { modalScrollbarStyles } from "../../../styles/orders.styles"
import { useEffect, useState } from "react"

export const Route = createFileRoute('/_layout/orders/$orderId')({
  component: OrderDetail,
})

function OrderDetail() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const showToast = useCustomToast()
  const [customerCompany, setCustomerCompany] = useState<string>('')

  const { data: order, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrdersService.readOrder({ id: orderId }),
  })

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (order?.customer_id) {
        try {
          const customerData = await CustomersService.readCustomer({
            id: order.customer_id
          });
          setCustomerCompany(customerData.company || 'N/A');
        } catch (error) {
          showToast("Error", "Failed to fetch customer details", "error");
          setCustomerCompany('N/A');
        }
      }
    };

    fetchCustomerDetails();
  }, [order?.customer_id, showToast]);

  if (isError) {
    showToast("Error", "Failed to load order details", "error")
  }

  const handleCustomerClick = () => {
    if (order?.customer_id) {
      navigate({ 
        to: '/customers/$customerId', 
        params: { customerId: order.customer_id } 
      })
    }
  }

  const orderDetails = [
    {
      section: "Basic Information",
      items: [
        { 
          label: "Customer", 
          value: customerCompany,
          onClick: handleCustomerClick,
          isLink: true 
        },
        { label: "Order Items", value: order?.order_items },
        { label: "Order Quantity", value: order?.order_quantity },
        { label: "Order Date", value: order?.order_date }
      ]
    },
    {
      section: "Order Status",
      items: [
        { label: "Order Status", value: order?.order_status },
        { label: "Payment Status", value: order?.payment_status },
        { label: "Total Price", value: order?.total_price ? `$${order.total_price}` : null }
      ]
    },
    {
      section: "Additional Information",
      items: [
        { label: "Notes", value: order?.notes }
      ]
    }
  ]

  return (
    <Modal 
      isOpen={true}
      onClose={() => navigate({ to: '/orders' })}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader>
          <Text fontSize="xl">Order Details</Text>
          <Box display="flex" gap={4}>
            <Text fontSize="sm" color="gray.600">
              ID: {order?.id}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Last Updated: {order?.order_update_date || 'N/A'}
            </Text>
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          {order && (
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {orderDetails.map((section) => (
                <Box key={section.section}>
                  <Text fontWeight="semibold" fontSize="lg" mb={4} color="gray.700">
                    {section.section}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {section.items.map(({ label, value, onClick, isLink }) => (
                      <Box 
                        key={label} 
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
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
                          color={isLink ? "blue.500" : value ? "black" : "gray.400"}
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                          cursor={isLink ? "pointer" : "default"}
                          _hover={isLink ? { textDecoration: "underline" } : undefined}
                          onClick={onClick}
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