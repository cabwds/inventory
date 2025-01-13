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
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  SimpleGrid,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"

import { OrdersService, Order, OrdersReadOrderData } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddOrder from "../../components/Orders/AddOrder"
import { PaginationFooter } from "../../components/Common/PaginationFooter"
import { modalScrollbarStyles, customerDetailsStyles } from "../../styles/customers.styles"

const ordersSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/orders")({
  component: Orders,
  validateSearch: (search) => ordersSearchSchema.parse(search),
})

const PER_PAGE = 5

function getOrdersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      OrdersService.readOrders({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["orders", { page }],
  }
}

function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  order: Order | null;
}) {
  const orderDetails = [
    {
      section: "Basic Information",
      items: [
        { label: "Customer ID", value: order?.customer_id },
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
        { label: "Total Price", value: order?.total_price ? `$${order.total_price}` : null },
        { label: "Is Valid", value: order?.is_valid ? "Yes" : "No" }
      ]
    },
    {
      section: "Additional Information",
      items: [
        { label: "Notes", value: order?.notes }
      ]
    }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="6xl" 
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader {...customerDetailsStyles.modalHeader}>
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
  );
}

function OrdersTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const showToast = useCustomToast()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: orders,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getOrdersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const handleOrderClick = async (orderId: string) => {
    try {
      const data: OrdersReadOrderData = {
        id: orderId
      }
      const orderData = await OrdersService.readOrder(data)
      setSelectedOrder(orderData)
      setIsModalOpen(true)
    } catch (error) {
      showToast("Failure!", "Order checking failed.", "error")
    }
  }

  const hasNextPage = !isPlaceholderData && orders?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getOrdersQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <OrderDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />
      <TableContainer {...customerDetailsStyles.tableContainer}>
        <Table size={{ base: "sm", md: "md" }} variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>No.</Th>
              <Th>Customer ID</Th>
              <Th>Status</Th>
              <Th>Total Amount</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {Array(5).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} speed={1} />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {orders?.data.map((order, index) => (
                <Tr 
                  key={order.id} 
                  opacity={isPlaceholderData ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td 
                    {...customerDetailsStyles.customerIdCell} 
                    onClick={() => handleOrderClick(order.id!)}
                    width="80px"
                    cursor="pointer"
                  >
                    {(page - 1) * PER_PAGE + index + 1}
                  </Td>
                  <Td isTruncated maxWidth="150px" fontWeight="medium">
                    {order.customer_id}
                  </Td>
                  <Td>{order.order_status}</Td>
                  <Td>${order.total_price}</Td>
                  <Td>
                    <ActionsMenu type="Order" value={order} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Box mt={4}>
        <PaginationFooter
          page={page}
          onChangePage={setPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </Box>
    </>
  )
}

function Orders() {
  return (
    <Container maxW="full" py={8}>
      <Box mb={8}>
        <Heading 
          size="lg" 
          textAlign={{ base: "center", md: "left" }}
          color="gray.700"
        >
          Orders Management
        </Heading>
      </Box>
      <Box mb={6}>
        <Navbar type="Order" addModalAs={AddOrder} />
      </Box>
      
      <OrdersTable />
    </Container>
  )
}
