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
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons"

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
  endDate
}: { 
  page: number; 
  pageSize: number;
  customerId?: string;
  orderStatus?: string;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
}) {
  return {
    queryFn: () => OrdersService.readOrders({ 
      ...(customerId && { customerId }),
      ...(orderStatus && { orderStatus }),
      ...(sortOrder && { sortOrder }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      skip: (page - 1) * pageSize, 
      limit: pageSize 
    }),
    queryKey: ["orders", { page, pageSize, customerId, orderStatus, sortOrder, startDate, endDate }],
  }
}

function useCustomerCompany(customerId: string | null | undefined) {
  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerId ? CustomersService.readCustomer({ id: customerId }) : null,
    enabled: !!customerId,
  })

  return customer?.company || 'N/A'
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
  const customerCompany = useCustomerCompany(order.customer_id)
  const navigate = useNavigate()

  const handleCustomerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (order.customer_id) {
      navigate({ to: '/customers/$customerId', params: { customerId: order.customer_id } })
    }
  }
  
  return (
    <Tr 
      key={order.id} 
      opacity={isPlaceholderData ? 0.5 : 1}
      _hover={{ bg: "gray.50" }}
      transition="background-color 0.2s"
    >
      <Td 
        {...customerDetailsStyles.customerIdCell} 
        onClick={() => onOrderClick(order.id!)}
        width="80px"
        cursor="pointer"
      >
        {(page - 1) * pageSize + index + 1}
      </Td>
      <Td 
        isTruncated 
        maxWidth="150px" 
        fontWeight="medium"
        cursor="pointer"
        _hover={{ color: "blue.500", textDecoration: "underline", transform: "scale(1.05)"}}
        onClick={handleCustomerClick}
      >
        <Text>
          {customerCompany}
        </Text>
      </Td>
      <Td>{order.order_status}</Td>
      <Td>${order.total_price}</Td>
      <Td>{order.order_date}</Td>
      <Td>
        <ActionsMenu type="Order" value={order} />
      </Td>
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
  const { page, pageSize, customerId, orderStatus, sortOrder, startDate, endDate } = Route.useSearch()
  const showToast = useCustomToast()
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
    ...getOrdersQueryOptions({ page, pageSize, customerId, orderStatus, sortOrder, startDate, endDate }),
    placeholderData: (prevData) => prevData,
  })

  const { data: customers, isLoading: isLoadingCustomers } = useCustomers()

  const handleOrderClick = (orderId: string) => {
    console.log(orderId)
    navigate({ to: '/orders/$orderId', params: { orderId } })
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
        startDate: e.target.value || undefined,
        page: 1
      })
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        endDate: e.target.value || undefined,
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
        endDate
      }))
    }
  }, [page, pageSize, customerId, orderStatus, sortOrder, queryClient, hasNextPage])

  return (
    <>
      <Box mb={4}>
        <HStack spacing={8} justify="space-between" align="flex-start" mb={4}>
          <VStack spacing={4} align="stretch" flex="1" maxW="800px">
            <HStack spacing={2}>
              <Select
                placeholder="Filter by customer"
                value={customerId || ""}
                onChange={handleCustomerChange}
                isDisabled={isLoadingCustomers}
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
            </HStack>
            
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Start Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={startDate || ""}
                  onChange={handleStartDateChange}
                  size="sm"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">End Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={endDate || ""}
                  onChange={handleEndDateChange}
                  size="sm"
                />
              </FormControl>
              
              {(customerId || orderStatus || sortOrder || startDate || endDate) && (
                <Button alignSelf="flex-end" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </HStack>
          </VStack>

          <HStack spacing={4} justify="flex-end">
            <Text fontSize="sm" color="gray.600">
              Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, (orders?.count || 0))} of {orders?.count || 0}
            </Text>
            <PageSizeSelector pageSize={pageSize} onChange={setPageSize} />
          </HStack>
        </HStack>
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
      <Outlet />
    </Container>
  )
}
