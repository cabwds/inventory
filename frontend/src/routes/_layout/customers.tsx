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

import { CustomersService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddCustomer from "../../components/Customers/AddCustomer"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"

const customersSearchSchema = z.object({
    page: z.number().catch(1),
  })

export const Route = createFileRoute("/_layout/customers")({
  component: Customers,
  validateSearch: (search) => customersSearchSchema.parse(search),
})


const PER_PAGE = 5

function getCustomersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      CustomersService.readCustomers({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["customers", { page }],
  }
}

function CustomersTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const {
    data: customers,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getCustomersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && customers?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getCustomersQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {customers?.data.map((customer) => (
                <Tr key={customer.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{customer.id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {customer.id}
                  </Td>
                  <Td
                    color={!customer.description ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {customer.description || "N/A"}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Customer"} value={customer} />
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

function Customers() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Customers Management
      </Heading>

      <Navbar type={"Customer"} addModalAs={AddCustomer} />
      <CustomersTable />
    </Container>
  )
}
