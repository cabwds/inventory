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
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { OrdersService, CustomersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddOrder from "../../components/Orders/AddOrder"
import { PaginationFooter } from "../../components/Common/PaginationFooter"
import { customerDetailsStyles } from "../../styles/customers.styles"

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
  isPlaceholderData, 
  onOrderClick 
}: { 
  order: any, 
  index: number, 
  page: number, 
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
        {(page - 1) * PER_PAGE + index + 1}
      </Td>
      <Td 
        isTruncated 
        maxWidth="150px" 
        fontWeight="medium"
        cursor="pointer"
        _hover={{ color: "blue.500" }}
        onClick={handleCustomerClick}
      >
        <Text>
          {customerCompany}
        </Text>
      </Td>
      <Td>{order.order_status}</Td>
      <Td>${order.total_price}</Td>
      <Td>
        <ActionsMenu type="Order" value={order} />
      </Td>
    </Tr>
  )
}

function OrdersTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const showToast = useCustomToast()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const {
    data: orders,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getOrdersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const handleOrderClick = (orderId: string) => {
    console.log(orderId)
    navigate({ to: '/orders/$orderId', params: { orderId } })
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
      <TableContainer {...customerDetailsStyles.tableContainer}>
        <Table size={{ base: "sm", md: "md" }} variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>No.</Th>
              <Th>Customer</Th>
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
                <OrderRow
                  key={order.id}
                  order={order}
                  index={index}
                  page={page}
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
