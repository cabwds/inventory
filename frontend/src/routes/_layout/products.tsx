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
  VStack,
  Tooltip,
  IconButton,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"
import { ChevronUpIcon, ChevronDownIcon, InfoIcon } from "@chakra-ui/icons"
import { ProductsService } from "../../client/index.ts"
import ActionsMenu from "../../components/Common/ActionsMenu.tsx"
import Navbar from "../../components/Common/Navbar.tsx"
import AddProduct from "../../components/Products/AddProduct.tsx"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"
import { PageSizeSelector } from "../../components/Common/PageSizeSelector"

type SortOrder = "asc" | "desc"

const productsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(5),
  brand: z.string().optional(),
  type: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortField: z.string().optional(),
  displayInvalid: z.boolean().optional(),
})

export const Route = createFileRoute("/_layout/products")({
  component: Products,
  validateSearch: (search) => productsSearchSchema.parse(search),
})

function getProductsQueryOptions({ 
  page, 
  pageSize, 
  brand, 
  type,
  sortOrder,
  sortField,
  displayInvalid
}: { 
  page: number; 
  pageSize: number;
  brand?: string;
  type?: string;
  sortOrder?: SortOrder;
  sortField?: string;
  displayInvalid?: boolean;
}) {
  return {
    queryFn: () => ProductsService.readProducts({ 
      ...(brand && { brand }),
      ...(type && { type }),
      ...(sortOrder && sortField && { sortOrder, sortField }),
      ...(displayInvalid !== undefined && { displayInvalid }),
      skip: (page - 1) * pageSize, 
      limit: pageSize 
    }),
    queryKey: ["products", { page, pageSize, brand, type, sortOrder, sortField, displayInvalid }],
  }
}

// Helper function to get currency symbol
const getCurrencySymbol = (currency: string | null | undefined): string => {
  if (!currency) return 'S$';
  
  switch (currency) {
    case 'SGD': return 'S$';
    case 'USD': return 'US$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CNY': return '¥';
    default: return 'S$';
  }
}

function SortableHeader({ 
  label, 
  field, 
  currentSortField, 
  currentSortOrder, 
  onSort 
}: { 
  label: string; 
  field: string; 
  currentSortField?: string; 
  currentSortOrder?: SortOrder; 
  onSort: (field: string) => void 
}) {
  const isActive = currentSortField === field;

  return (
    <HStack 
      spacing={1} 
      cursor="pointer" 
      onClick={() => onSort(field)}
      _hover={{ color: "blue.500" }}
      transition="color 0.2s"
    >
      <Text>{label}</Text>
      <Box color={isActive ? "blue.500" : "gray.400"}>
        {isActive && (currentSortOrder === "desc" ? <ChevronDownIcon /> : <ChevronUpIcon />)}
        {!isActive && <ChevronUpIcon opacity={0.3} />}
      </Box>
    </HStack>
  )
}

function ProductRow({ 
  product, 
  index, 
  page, 
  pageSize, 
  isPlaceholderData 
}: { 
  product: any, 
  index: number, 
  page: number, 
  pageSize: number, 
  isPlaceholderData: boolean
}) {
  return (
    <Tr 
      key={product.id} 
      opacity={isPlaceholderData ? 0.5 : 1}
      _hover={{ bg: "gray.50" }}
      transition="background-color 0.2s"
      bg={!product.is_valid ? "red.50" : undefined}
    >
      <Td width="80px">
        {(page - 1) * pageSize + index + 1}
        {!product.is_valid && (
          <Tooltip label="This product has been marked as invalid">
            <InfoIcon 
              color="red.500" 
              boxSize="14px"
              ml={2}
            />
          </Tooltip>
        )}
      </Td>
      <Td isTruncated maxWidth="150px">
        <Text fontWeight="medium">
          {product.id || "N/A"}
        </Text>
      </Td>
      <Td isTruncated maxWidth="150px">
        {product.brand || "N/A"}
      </Td>
      <Td
        color={!product.type ? "gray.500" : "inherit"}
        isTruncated
        maxWidth="150px"
      >
        {product.type || "N/A"}
      </Td>
      <Td isTruncated maxWidth="150px">
        {product.unit_price != null 
          ? `${getCurrencySymbol(product.price_currency)} ${product.unit_price.toFixed(2)}`
          : "N/A"
        }
      </Td>
      <Td isTruncated maxWidth="150px">
        {product.unit_cost != null 
          ? `${getCurrencySymbol(product.cost_currency)} ${product.unit_cost.toFixed(2)}`
          : "N/A"
        }
      </Td>
      <Td>
        <ActionsMenu 
          type="Product" 
          value={product} 
          disabled={!product.is_valid}
        />
      </Td>
    </Tr>
  )
}

function ProductsTable() {
  const queryClient = useQueryClient()
  const { page, pageSize, brand, type, sortOrder, sortField, displayInvalid } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const currentUser = queryClient.getQueryData(["currentUser"])
  
  const setPage = (newPage: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }) })
    
  const setPageSize = (newSize: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, pageSize: newSize, page: 1 }) })

  const {
    data: products,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getProductsQueryOptions({ 
      page, 
      pageSize, 
      brand, 
      type, 
      sortOrder, 
      sortField,
      displayInvalid
    }),
    placeholderData: (prevData) => prevData,
  })

  // Get unique brands and types for filters
  const uniqueBrands = Array.from(
    new Set(
      queryClient
        .getQueryData<any>(["products"])
        ?.data?.map((p: any) => p.brand)
        .filter(Boolean) || []
    )
  )

  const uniqueTypes = Array.from(
    new Set(
      queryClient
        .getQueryData<any>(["products"])
        ?.data?.map((p: any) => p.type)
        .filter(Boolean) || []
    )
  )

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBrand = e.target.value
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        brand: selectedBrand || undefined,
        page: 1
      })
    })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        type: selectedType || undefined,
        page: 1
      })
    })
  }

  const handleSort = (field: string) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        sortField: field,
        sortOrder: sortField === field && sortOrder === "asc" ? "desc" : "asc",
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
        brand: undefined,
        type: undefined,
        sortOrder: undefined,
        sortField: undefined,
        displayInvalid: undefined,
        page: 1 
      })
    })
  }

  const hasNextPage = !isPlaceholderData && products?.data.length === pageSize
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getProductsQueryOptions({ 
        page: page + 1, 
        pageSize, 
        brand, 
        type,
        sortOrder,
        sortField,
        displayInvalid
      }))
    }
  }, [page, pageSize, brand, type, sortOrder, sortField, displayInvalid, queryClient, hasNextPage])

  return (
    <>
      <Box mb={4}>
        <VStack spacing={4} align="stretch">
          {/* Filters */}
          <HStack spacing={4}>
            <Select
              placeholder="Filter by brand"
              value={brand || ""}
              onChange={handleBrandChange}
              maxW="250px"
            >
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Filter by type"
              value={type || ""}
              onChange={handleTypeChange}
              maxW="250px"
            >
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            {currentUser?.is_superuser && (
              <Select
                value={displayInvalid ? 'all' : 'valid'}
                onChange={handleDisplayInvalidToggle}
                maxW="200px"
              >
                <option value="valid">Valid Products Only</option>
                <option value="all">All Products</option>
              </Select>
            )}
            {(brand || type || sortOrder || (currentUser?.is_superuser && displayInvalid)) && (
              <Button size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </HStack>

          {/* Page size and count */}
          <HStack spacing={4} justify="flex-end">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, (products?.count || 0))} of {products?.count || 0}
            </Text>
            <PageSizeSelector pageSize={pageSize} onChange={setPageSize} />
          </HStack>
        </VStack>
      </Box>

      <TableContainer>
        <Table size={{ base: "sm", md: "md" }} variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th width="80px">No.</Th>
              <Th>Name</Th>
              <Th>
                <SortableHeader 
                  label="Brand" 
                  field="brand" 
                  currentSortField={sortField} 
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              </Th>
              <Th>Type</Th>
              <Th>
                <SortableHeader 
                  label="Unit Price" 
                  field="unit_price" 
                  currentSortField={sortField} 
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              </Th>
              <Th>Unit Cost</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {Array(7).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} speed={1} />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {products?.data.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  page={page}
                  pageSize={pageSize}
                  isPlaceholderData={isPlaceholderData}
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

function Products() {
  return (
    <Container maxW="full" py={8}>
      <Box mb={4} display="flex" alignItems="center">
        <Heading 
          size="lg" 
          textAlign={{ base: "center", md: "left" }}
          color="gray.700"
          mr="auto"
        >
          Products Management
        </Heading>
        <Box mr={32}>
          <Navbar type="Product" addModalAs={AddProduct} />
        </Box>
      </Box>
      
      <ProductsTable />
      <Outlet />
    </Container>
  )
}
