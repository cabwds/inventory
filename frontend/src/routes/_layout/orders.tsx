import {
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
  Text,
  Select,
  Button,
  HStack,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Tooltip,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import { ChevronUpIcon, ChevronDownIcon, InfoIcon, DownloadIcon } from "@chakra-ui/icons"
import type { UserPublic } from "../../client"
import { OrdersService, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddOrder from "../../components/Orders/AddOrder"
import { PaginationFooter } from "../../components/Common/PaginationFooter"
import { customerDetailsStyles } from "../../styles/customers.styles"
import { PageSizeSelector } from "../../components/Common/PageSizeSelector"

type SortOrder = "asc" | "desc"

const ordersSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(5),
  customerId: z.string().optional(),
  orderStatus: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  displayInvalid: z.boolean().optional(),
})

export const Route = createFileRoute("/_layout/orders")({
  component: Orders,
  validateSearch: (search) => ordersSearchSchema.parse(search),
})

function getOrdersQueryOptions({ 
  page, 
  pageSize, 
  customerId, 
  orderStatus,
  sortOrder,
  startDate,
  endDate,
  displayInvalid
}: { 
  page: number; 
  pageSize: number;
  customerId?: string;
  orderStatus?: string;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
  displayInvalid?: boolean;
}) {
  return {
    queryFn: () => OrdersService.readOrders({ 
      ...(customerId && { customerId }),
      ...(orderStatus && { orderStatus }),
      ...(sortOrder && { sortOrder }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(displayInvalid !== undefined && { displayInvalid }),
      skip: (page - 1) * pageSize, 
      limit: pageSize 
    }),
    queryKey: ["orders", { page, pageSize, customerId, orderStatus, sortOrder, startDate, endDate, displayInvalid }],
  }
}

function useCustomerDetails(customerId: string | null | undefined) {
  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerId ? CustomersService.readCustomer({ id: customerId }) : null,
    enabled: !!customerId,
  })

  return {
    company: customer?.company || 'N/A',
    isValid: customer?.is_valid ?? true
  }
}

function OrderRow({ 
  order, 
  index, 
  page, 
  pageSize, 
  isPlaceholderData, 
  onOrderClick 
}: { 
  order: any, 
  index: number, 
  page: number, 
  pageSize: number, 
  isPlaceholderData: boolean,
  onOrderClick: (orderId: string) => void
}) {
  const { company, isValid } = useCustomerDetails(order.customer_id)
  const navigate = useNavigate()
  const showToast = useCustomToast()

  const handleCustomerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (order.customer_id) {
      navigate({ 
        to: '/customers/$customerId', 
        params: { customerId: order.customer_id },
        search: { returnTo: '/orders' },
        replace: false
      })
    }
  }
  
  const [isInvoiceCurrencyModalOpen, setIsInvoiceCurrencyModalOpen] = useState<boolean>(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('SGD')
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setProcessingOrderId(order.id)
    setIsInvoiceCurrencyModalOpen(true)
  }

  const downloadInvoiceWithCurrency = async (orderId: string, currency: string) => {
    try {
      // Get the base URL from the OpenAPI configuration
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      // Make the API call to get the invoice with selected currency
      const response = await fetch(`${baseUrl}/api/v1/orders/get-order-invoice/${orderId}?output_currency=${currency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Get current date for filename
      const currentDate = new Date().toISOString().split('T')[0]
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${order.id}_${currentDate}.xlsx`
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Release the URL object
      window.URL.revokeObjectURL(url)
      
      // Close loading toast and show success
      showToast(
        "Success",
        "Invoice downloaded successfully",
        "success"
      )
    } catch (error) {
      console.error("Error downloading invoice:", error)
      showToast(
        "Error",
        "Failed to download invoice. Please try again later.",
        "error"
      )
    }
  }
  
  return (
    <Tr 
      key={order.id} 
      opacity={isPlaceholderData ? 0.5 : 1}
      _hover={{ bg: "gray.50" }}
      transition="background-color 0.2s"
      bg={!order.is_valid ? "red.50" : undefined}
      position="relative"
      onClick={() => onOrderClick(order.id!)}
      cursor="pointer"
    >
      <Td 
        {...customerDetailsStyles.customerIdCell} 
        width="80px"
      >
        {(page - 1) * pageSize + index + 1}
        {!order.is_valid && (
          <Tooltip label="This order has been marked as invalid">
            <InfoIcon 
              color="red.500" 
              boxSize="14px"
              ml={2}
            />
          </Tooltip>
        )}
      </Td>
      <Td onClick={(e) => e.stopPropagation()}>
        <HStack spacing={2}>
          {!isValid && (
            <Tooltip label="Customer record has been deleted">
              <InfoIcon 
                color="orange.500" 
                boxSize="14px"
              />
            </Tooltip>
          )}
          <Text
            isTruncated 
            maxWidth="150px" 
            fontWeight="medium"
            cursor="pointer"
            color={!order.is_valid ? "red.600" : !isValid ? "gray.600" : undefined}
            _hover={{ 
              color: !order.is_valid ? "red.500" : !isValid ? "orange.500" : "blue.500", 
              textDecoration: "underline", 
              transform: "scale(1.05)"
            }}
            onClick={handleCustomerClick}
          >
            {company}
          </Text>
        </HStack>
      </Td>
      <Td color={!order.is_valid ? "red.600" : !isValid ? "gray.600" : undefined}>
        {order.order_status}
      </Td>
      <Td color={!order.is_valid ? "red.600" : !isValid ? "gray.600" : undefined}>
        ${order.total_price}
      </Td>
      <Td color={!order.is_valid ? "red.600" : !isValid ? "gray.600" : undefined}>
        {order.order_date}
      </Td>
      <Td onClick={(e) => e.stopPropagation()}>
        <HStack spacing={2}>
          <IconButton
            aria-label="Download Invoice"
            icon={<DownloadIcon />}
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={handleDownloadInvoice}
            isDisabled={!order.is_valid}
            title="Download Invoice"
          />
          <ActionsMenu 
            type="Order" 
            value={order} 
            disabled={!order.is_valid}
          />
        </HStack>
      </Td>

      {/* Currency Selection Modal */}
      <Modal
        isOpen={isInvoiceCurrencyModalOpen}
        onClose={() => setIsInvoiceCurrencyModalOpen(false)}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Invoice Currency</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Currency</FormLabel>
              <Select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="MYR">MYR - Malaysia Ringgit</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="USD">USD - US Dollar</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                setIsInvoiceCurrencyModalOpen(false)
                if (processingOrderId) {
                  downloadInvoiceWithCurrency(processingOrderId, selectedCurrency)
                }
              }}
            >
              Download
            </Button>
            <Button onClick={() => setIsInvoiceCurrencyModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Tr>
  )
}

function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => CustomersService.readCustomers({ limit: 100 }),
  })
}

// First, let's define the order status options
const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Completed",
  "Cancelled"
] as const;

// First, let's create a styled header component for the sort toggle
function SortableHeader({ sortOrder, onToggle }: { sortOrder?: SortOrder; onToggle: () => void }) {
  return (
    <HStack 
      spacing={1} 
      cursor="pointer" 
      onClick={onToggle}
      _hover={{ color: "blue.500" }}
      transition="color 0.2s"
    >
      <Text>Created Date</Text>
      <Box color={sortOrder ? "blue.500" : "gray.400"}>
        {sortOrder === "desc" ? <ChevronDownIcon /> : <ChevronUpIcon />}
      </Box>
    </HStack>
  )
}

function OrdersTable() {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { page, pageSize, customerId, orderStatus, sortOrder, startDate, endDate, displayInvalid } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (newPage: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }) })
    
  const setPageSize = (newSize: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, pageSize: newSize, page: 1 }) })

  const {
    data: orders,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getOrdersQueryOptions({ 
      page, 
      pageSize, 
      customerId, 
      orderStatus, 
      sortOrder, 
      startDate, 
      endDate,
      displayInvalid
    }),
    placeholderData: (prevData) => prevData,
  })

  const { data: customers, isLoading: isLoadingCustomers } = useCustomers()

  const handleOrderClick = (orderId: string) => {
    navigate({ 
      to: '/orders/$orderId', 
      params: { orderId },
      replace: false  // Don't replace the current URL to keep proper history
    })
  }

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomerId = e.target.value
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        customerId: selectedCustomerId || undefined,
        page: 1
      })
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        orderStatus: selectedStatus || undefined,
        page: 1
      })
    })
  }

  const toggleSortOrder = () => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        sortOrder: sortOrder === "desc" ? "asc" : "desc",
        page: 1
      })
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        startDate: e.target.value ? `${e.target.value}T00:00:00` : undefined,
        page: 1
      })
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        endDate: e.target.value ? `${e.target.value}T23:59:59` : undefined,
        page: 1
      })
    })
  }

  const handleDisplayInvalidToggle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        displayInvalid: e.target.value === 'all',
        page: 1
      })
    })
  }

  const clearFilters = () => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        customerId: undefined,
        orderStatus: undefined,
        sortOrder: undefined,
        startDate: undefined,
        endDate: undefined,
        displayInvalid: undefined,
        page: 1 
      })
    })
  }

  const hasNextPage = !isPlaceholderData && orders?.data.length === pageSize
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getOrdersQueryOptions({ 
        page: page + 1, 
        pageSize, 
        customerId, 
        orderStatus,
        sortOrder,
        startDate,
        endDate,
        displayInvalid
      }))
    }
  }, [page, pageSize, customerId, orderStatus, sortOrder, displayInvalid, queryClient, hasNextPage])

  return (
    <>
      <Box mb={4}>
        <VStack spacing={4} align="stretch">
          {/* First row: Customer and Status filters */}
          <HStack spacing={4}>
            <Select
              placeholder="Filter by customer"
              value={customerId || ""}
              onChange={handleCustomerChange}
              isDisabled={isLoadingCustomers}
              maxW="300px"
            >
              {customers?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              value={orderStatus || ""}
              onChange={handleStatusChange}
              maxW="200px"
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            {currentUser?.is_superuser && (
              <Select
                value={displayInvalid ? 'all' : 'valid'}
                onChange={handleDisplayInvalidToggle}
                maxW="200px"
              >
                <option value="valid">Valid Orders Only</option>
                <option value="all">All Orders</option>
              </Select>
            )}
            {(customerId || orderStatus || sortOrder || startDate || endDate || (currentUser?.is_superuser && displayInvalid)) && (
              <Button size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </HStack>

          {/* Second row: Date filters and pagination info */}
          <HStack spacing={4} justify="space-between">
            <HStack spacing={4} flex="1">
              <FormControl maxW="200px">
                <FormLabel fontSize="sm" mb={1}>Start Date</FormLabel>
                <Input
                  type="date"
                  value={startDate?.split('T')[0] || ""}
                  onChange={handleStartDateChange}
                  size="md"
                />
              </FormControl>
              
              <FormControl maxW="200px">
                <FormLabel fontSize="sm" mb={1}>End Date</FormLabel>
                <Input
                  type="date"
                  value={endDate?.split('T')[0] || ""}
                  onChange={handleEndDateChange}
                  size="md"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} justify="flex-end">
              <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, (orders?.count || 0))} of {orders?.count || 0}
              </Text>
              <PageSizeSelector pageSize={pageSize} onChange={setPageSize} />
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <TableContainer {...customerDetailsStyles.tableContainer}>
        <Table size={{ base: "sm", md: "md" }} variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>No.</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Total Amount</Th>
              <Th>
                <SortableHeader 
                  sortOrder={sortOrder} 
                  onToggle={toggleSortOrder}
                />
              </Th>
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
                <OrderRow
                  key={order.id}
                  order={order}
                  index={index}
                  page={page}
                  pageSize={pageSize}
                  isPlaceholderData={isPlaceholderData}
                  onOrderClick={handleOrderClick}
                />
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
      <Box mb={2} display="flex" alignItems="center">
        <Heading 
          size="lg" 
          textAlign={{ base: "center", md: "left" }}
          color="gray.700"
          mr="auto"
        >
          Orders Management
        </Heading>
        <Box mr={32}>
          <Navbar type="Order" addModalAs={AddOrder} />
        </Box>
      </Box>
      
      <OrdersTable />
      <Outlet />
    </Container>
  )
}
