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

import { CustomersService , CustomersReadCustomerData, Customer } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddCustomer from "../../components/Customers/AddCustomer"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"
import { modalScrollbarStyles, customerDetailsStyles } from "../../styles/customers.styles"

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



function CustomerDetailsModal({ 
  isOpen, 
  onClose, 
  customer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  customer: Customer | null;
}) {
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
        { label: "Order List", value: customer?.order_ids }
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
          <Text fontSize="xl">Customer Details</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {customer?.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          {customer && (
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {customerDetails.map((section) => (
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
      <CustomerDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customer={selectedCustomer} 
      />
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
              {customers?.data.map((customer, index) => (
                <Tr 
                  key={customer.id} 
                  opacity={isPlaceholderData ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td 
                    {...customerDetailsStyles.customerIdCell} 
                    onClick={() => handleCustomerClick(customer.id)}
                    width="80px"
                  >
                    {(page - 1) * PER_PAGE + index + 1}
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
                  <Td>
                    <ActionsMenu type="Customer" value={customer} />
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
      <Box mb={8}>
        <Heading 
          size="lg" 
          textAlign={{ base: "center", md: "left" }}
          color="gray.700"
        >
          Customers Management
        </Heading>
      </Box>
      <Box mb={6}>
        <Navbar type="Customer" addModalAs={AddCustomer} />
      </Box>
      
      <CustomersTable />
    </Container>
  )
}
