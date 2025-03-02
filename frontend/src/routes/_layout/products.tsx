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
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import { ChevronUpIcon, ChevronDownIcon, InfoIcon, SearchIcon } from "@chakra-ui/icons"
import { ProductsService, UserPublic } from "../../client/index.ts"
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
  keyword: z.string().optional(),
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
  displayInvalid
}: { 
  page: number; 
  pageSize: number;
  brand?: string;
  type?: string;
  displayInvalid?: boolean;
}) {
  return {
    queryFn: () => ProductsService.readProducts({ 
      ...(brand && { brand }),
      ...(type && { type }),
      ...(displayInvalid !== undefined && { displayInvalid }),
      skip: (page - 1) * pageSize, 
      limit: pageSize 
    }),
    queryKey: ["products", { page, pageSize, brand, type, displayInvalid }],
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
  const navigate = useNavigate({ from: Route.fullPath })

  const handleProductClick = (productId: string) => {
    navigate({ to: '/products/$productId', params: { productId } })
  }

  return (
    <Tr 
      key={product.id} 
      opacity={isPlaceholderData ? 0.5 : 1}
      _hover={{ bg: "gray.50" }}
      transition="background-color 0.2s"
      bg={!product.is_valid ? "red.50" : undefined}
      onClick={() => handleProductClick(product.id)}
      cursor="pointer"
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
      <Td onClick={(e) => e.stopPropagation()}>
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
  const { page, pageSize, brand, type, keyword, displayInvalid } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const [searchTerm, setSearchTerm] = useState(keyword || "")
  
  const setPage = (newPage: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }) })
    
  const setPageSize = (newSize: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, pageSize: newSize, page: 1 }) })

  // Get all products for client-side filtering
  const { data: allProducts, isPending: isLoadingAllProducts } = useQuery({
    queryKey: ["products-all"],
    queryFn: () => ProductsService.readProducts({ limit: 1000 }), // Get a larger batch for client-side filtering
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Apply client-side filtering
  const filteredProducts = allProducts?.data.filter(product => {
    // Apply all filters
    const matchesKeyword = !keyword || 
      (product.id?.toLowerCase().includes(keyword.toLowerCase()));
    const matchesBrand = !brand || product.brand === brand;
    const matchesType = !type || product.type === type;
    const matchesValidity = !displayInvalid ? product.is_valid !== false : true;
    
    return matchesKeyword && matchesBrand && matchesType && matchesValidity;
  }) || [];

  // Apply pagination
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Use allProducts instead of the current query cache for filter options
  const uniqueBrands = Array.from(
    new Set(
      allProducts?.data?.map(p => p.brand).filter(Boolean) || []
    )
  ) as string[];

  const uniqueTypes = Array.from(
    new Set(
      allProducts?.data?.map(p => p.type).filter(Boolean) || []
    )
  ) as string[];

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
    setSearchTerm("")
    navigate({ 
      search: (prev: Record<string, unknown>) => ({ 
        ...prev, 
        brand: undefined,
        type: undefined,
        keyword: undefined,
        displayInvalid: undefined,
        page: 1 
      })
    })
  }

  const hasNextPage = filteredProducts.length > page * pageSize
  const hasPreviousPage = page > 1
  const isPending = isLoadingAllProducts

  return (
    <>
      <Box mb={4}>
        <VStack spacing={4} align="stretch">
          {/* Filters */}
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search products (e.g. FM)"
                value={searchTerm}
                onChange={handleKeywordChange}
                size="md"
              />
            </InputGroup>
            <Select
              placeholder="Filter by Brand"
              value={brand || ""}
              onChange={handleBrandChange}
              maxW="200px"
            >
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Type"
              value={type || ""}
              onChange={handleTypeChange}
              maxW="160px"
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
            {(searchTerm || brand || type || (currentUser?.is_superuser && displayInvalid)) && (
              <Button size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </HStack>

          {/* Page size and count */}
          <HStack spacing={4} justify="flex-end">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Showing {filteredProducts.length === 0 ? 0 : ((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}
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
              <Th>Brand</Th>
              <Th>Type</Th>
              <Th>Unit Price</Th>
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
              {paginatedProducts.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  page={page}
                  pageSize={pageSize}
                  isPlaceholderData={false}
                />
              ))}
              {paginatedProducts.length === 0 && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={4}>
                    No products found. Try adjusting your search criteria.
                  </Td>
                </Tr>
              )}
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
