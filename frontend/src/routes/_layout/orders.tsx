import {
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
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { OrdersService } from "../../client/index.ts"
import ActionsMenu from "../../components/Common/ActionsMenu.tsx"
import Navbar from "../../components/Common/Navbar.tsx"
import AddOrder from "../../components/Orders/AddOrder.tsx"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"

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

function OrdersTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
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

  const hasNextPage = !isPlaceholderData && orders?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getOrdersQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Total Amount</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(5).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {orders?.data.map((order) => (
                <Tr key={order.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{order.id}</Td>
                  <Td isTruncated maxWidth="150px">
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
      <PaginationFooter
        page={page}
        onChangePage={setPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  )
}

function Orders() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Orders Management
      </Heading>

      <Navbar type="Order" addModalAs={AddOrder} />
      <OrdersTable />
    </Container>
  )
}
