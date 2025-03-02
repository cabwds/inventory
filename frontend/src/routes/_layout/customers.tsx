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
    Select,
    Tooltip,
    InputGroup,
    InputLeftElement,
    Input,
    HStack,
    VStack,
    Text,
    Button,
    } from "@chakra-ui/react"
import { InfoIcon, SearchIcon } from "@chakra-ui/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet} from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"

import { CustomersService} from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddCustomer from "../../components/Customers/AddCustomer"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"
import { customerDetailsStyles } from "../../styles/customers.styles"
import { PageSizeSelector } from "../../components/Common/PageSizeSelector"
import type { UserPublic } from "../../client"

const customersSearchSchema = z.object({
    page: z.number().catch(1),
    pageSize: z.number().catch(5),
    displayInvalid: z.boolean().optional(),
    keyword: z.string().optional(),
})

export const Route = createFileRoute("/_layout/customers")({
  component: Customers,
  validateSearch: (search) => customersSearchSchema.parse(search),
})

function getCustomersQueryOptions({ page, pageSize, displayInvalid }: { 
  page: number; 
  pageSize: number;
  displayInvalid?: boolean;
}) {
  return {
    queryFn: () =>
      CustomersService.readCustomers({ 
        skip: (page - 1) * pageSize, 
        limit: pageSize,
        ...(displayInvalid !== undefined && { displayInvalid }),
      }),
    queryKey: ["customers", { page, pageSize, displayInvalid }],
  }
}

function CustomersTable() {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { page, pageSize, displayInvalid, keyword } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchTerm, setSearchTerm] = useState(keyword || "")
  
  const setPage = (newPage: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }) })
    
  const setPageSize = (newSize: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, pageSize: newSize, page: 1 }) })

  const handleDisplayInvalidToggle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        displayInvalid: e.target.value === 'all',
        page: 1
      })
    })
  }

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  // Update URL with debounced keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ 
        search: (prev: Record<string, unknown>) => ({ 
          ...prev, 
          keyword: searchTerm || undefined,
          page: 1
        })
      })
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, navigate])

  const clearFilters = () => {
    setSearchTerm("")
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        keyword: undefined,
        displayInvalid: undefined,
        page: 1 
      })
    })
  }

  // Get all customers for client-side filtering
  const { data: allCustomers, isPending: isLoadingAllCustomers } = useQuery({
    queryKey: ["customers", displayInvalid],
    queryFn: () => CustomersService.readCustomers({ 
      limit: 1000,
      displayInvalid: displayInvalid
    }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Apply client-side filtering
  const filteredCustomers = allCustomers?.data.filter(customer => {
    // Apply keyword filter
    const matchesKeyword = !keyword || 
      (customer.company?.toLowerCase().includes(keyword.toLowerCase()));
    
    return matchesKeyword;
  }) || [];

  // Apply pagination
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleCustomerClick = (customerId: string) => {
    navigate({ to: '/customers/$customerId', params: { customerId } })
  }

  const hasNextPage = filteredCustomers.length > page * pageSize
  const hasPreviousPage = page > 1
  const isPending = isLoadingAllCustomers

  return (
    <>
      <Box mb={4}>
        <VStack spacing={4} align="stretch">
          {/* Filters */}
          <HStack spacing={4} justifyContent="space-between">
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search company name"
                  value={searchTerm}
                  onChange={handleKeywordChange}
                  size="md"
                />
              </InputGroup>
              {currentUser?.is_superuser && (
                <Select
                  value={displayInvalid ? 'all' : 'valid'}
                  onChange={handleDisplayInvalidToggle}
                  maxW="220px"
                >
                  <option value="valid">Valid Customers Only</option>
                  <option value="all">All Customers</option>
                </Select>
              )}
              {(searchTerm || (currentUser?.is_superuser && displayInvalid)) && (
                <Button 
                  size="md" 
                  onClick={clearFilters}
                  px={4}
                  minW="110px"
                  textAlign="center"
                >
                  Clear Filters
                </Button>
              )}
            </HStack>
            <PageSizeSelector pageSize={pageSize} onChange={setPageSize} />
          </HStack>

          {/* Page size and count */}
          <HStack spacing={4} justify="flex-end">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Showing {filteredCustomers.length === 0 ? 0 : ((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
            </Text>
          </HStack>
        </VStack>
      </Box>
      <TableContainer {...customerDetailsStyles.tableContainer}>
        <Table size={{ base: "sm", md: "md" }} variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>No.</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} speed={1} />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {paginatedCustomers.map((customer, index) => (
                <Tr 
                  key={customer.id} 
                  opacity={isPending ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                  bg={!customer.is_valid ? "red.50" : undefined}
                  onClick={() => handleCustomerClick(customer.id)}
                  cursor="pointer"
                >
                  <Td 
                    {...customerDetailsStyles.customerIdCell} 
                    width="80px"
                  >
                    {(page - 1) * pageSize + index + 1}
                    {!customer.is_valid && (
                      <Tooltip label="This customer has been marked as invalid">
                        <InfoIcon 
                          color="red.500" 
                          boxSize="14px"
                          ml={2}
                        />
                      </Tooltip>
                    )}
                  </Td>
                  <Td isTruncated maxWidth="150px" fontWeight="medium">
                    {customer.company}
                  </Td>
                  <Td
                    color={!customer.email ? "gray.400" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {customer.email || "N/A"}
                  </Td>
                  <Td
                    color={!customer.phone ? "gray.400" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {customer.phone || "N/A"}
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <ActionsMenu type="Customer" value={customer} disabled={!customer.is_valid}/>
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

function Customers() {
  return (
    <Container maxW="full" py={8}>
      <Box mb={2} display="flex" alignItems="center">
        <Heading 
          size="lg" 
          textAlign={{ base: "center", md: "left" }}
          color="gray.700"
          mr="auto"
        >
          Customers Management
        </Heading>
        <Box mr={32}>
          <Navbar type="Customer" addModalAs={AddCustomer} />
        </Box>
      </Box>
      <CustomersTable />
      <Outlet />
    </Container>
  )
}
