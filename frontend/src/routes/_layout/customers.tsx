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
    } from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"

import { CustomersService , CustomersReadCustomerData, Customer } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
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
  const showToast = useCustomToast()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)


  const {
    data: customers,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getCustomersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const handleCustomerClick = async (customerId : string) => {
    try {
      const data: CustomersReadCustomerData = {
        id: customerId  // Pass the ID in the expected format
      }
      const customerData = await CustomersService.readCustomer(data)
      setSelectedCustomer(customerData)
      setIsModalOpen(true)
    } catch (error) {
      showToast("Failure!", "Customer checking failed.", "error")
    }
  }

  const hasNextPage = !isPlaceholderData && customers?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getCustomersQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedCustomer && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Company</Text>
                  <Text>{selectedCustomer.company}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Email</Text>
                  <Text>{selectedCustomer.email || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Phone</Text>
                  <Text>{selectedCustomer.phone || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Full Name</Text>
                  <Text>{selectedCustomer.full_name || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Gender</Text>
                  <Text>{selectedCustomer.gender || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Preferred Language</Text>
                  <Text>{selectedCustomer.preferred_language || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Description</Text>
                  <Text>{selectedCustomer.description || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Address</Text>
                  <Text>{selectedCustomer.address || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Order List</Text>
                  <Text>{selectedCustomer.order_ids || 'N/A'}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
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
                  <Td isTruncated 
                      maxWidth="50px"
                      cursor="pointer"
                      color="blue.500"
                      _hover={{ color: "blue.600", textDecoration: "underline" }}
                      onClick={() => handleCustomerClick(customer.id)}
                  >
                      {customer.id}
                  </Td>
                  <Td 
                    isTruncated 
                    maxWidth="150px"
                  >
                    {customer.company}
                  </Td>
                  <Td
                    color={!customer.email ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {customer.email || "N/A"}
                  </Td>
                  <Td
                    color={!customer.phone ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {customer.phone || "N/A"}
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
