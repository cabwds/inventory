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
  Box,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, Outlet} from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"
import { ProductsService } from "../../client/index.ts"
import ActionsMenu from "../../components/Common/ActionsMenu.tsx"
import Navbar from "../../components/Common/Navbar.tsx"
import AddProduct from "../../components/Products/AddProduct.tsx"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"

const productsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/products")({
  component: Products,
  validateSearch: (search) => productsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getProductsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ProductsService.readProducts({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["products", { page }],
  }
}

// Add this helper function to map currency codes to symbols
const getCurrencySymbol = (currency: string | null | undefined): string => {
  if (!currency) return 'S$'; // Default to SGD (Singapore Dollar)
  
  switch (currency) {
    case 'SGD': return 'S$';
    case 'USD': return 'US$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CNY': return '¥';
    default: return 'S$';
  }
}

function ProductsTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const {
    data: products,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getProductsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && products?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getProductsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
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
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {products?.data.map((product) => (
                <Tr key={product.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{product.id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {product.brand}
                  </Td>
                  <Td
                    color={!product.type ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {product.type || "N/A"}
                  </Td>
                  <Td
                    isTruncated
                    maxWidth="150px"
                  >
                    {product.unit_price != null 
                      ? `${getCurrencySymbol(product.price_currency)} ${product.unit_price.toFixed(2)}`
                      : "N/A"
                    }
                  </Td>
                  <Td
                    isTruncated
                    maxWidth="150px"
                  >
                    {product.unit_cost != null 
                      ? `${getCurrencySymbol(product.cost_currency)} ${product.unit_cost.toFixed(2)}`
                      : "N/A"
                    }
                  </Td>
                  <Td>
                    <ActionsMenu type={"Product"} value={product} />
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

function Products() {
  return (
    <Container maxW="full" py={8}>
    <Box mb={2} display="flex" alignItems="center">
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
