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
  SimpleGrid,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
} from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ProductsService } from "../../../client"
import useCustomToast from "../../../hooks/useCustomToast"
import { modalScrollbarStyles } from "../../../styles/customers.styles"

export const Route = createFileRoute('/_layout/products/$productId')({
  component: ProductDetail,
})

function ProductDetail() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const showToast = useCustomToast()

  const { data: product, isError, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductsService.readProduct({ id: productId }),
  })

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

  // Format price with currency symbol
  const formatPrice = (amount: number | null | undefined, currency: string | null | undefined) => {
    if (amount == null) return 'N/A';
    return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;
  }

  if (isError) {
    showToast("Error", "Failed to load product details", "error")
  }

  const productDetails = [
    {
      section: "Basic Information",
      items: [
        { label: "Product Name", value: product?.id },
        { label: "Brand", value: product?.brand },
        { label: "Type", value: product?.type },
        { 
          label: "Status", 
          value: product?.is_valid === false ? (
            <Badge colorScheme="red">Invalid</Badge>
          ) : (
            <Badge colorScheme="green">Active</Badge>
          )
        },
      ]
    },
    {
      section: "Pricing",
      items: [
        { 
          label: "Unit Price", 
          value: formatPrice(product?.unit_price, product?.price_currency)
        },
        { 
          label: "Price Currency", 
          value: product?.price_currency
        },
        { 
          label: "Unit Cost", 
          value: formatPrice(product?.unit_cost, product?.cost_currency)
        },
        { 
          label: "Cost Currency", 
          value: product?.cost_currency
        },
      ]
    },
    {
      section: "Dimensions",
      items: [
        { 
          label: "Width", 
          value: product?.width != null ? `${product.width} m` : 'N/A'
        },
        { 
          label: "Length", 
          value: product?.length != null ? `${product.length} m` : 'N/A'
        },
        { 
          label: "Thickness", 
          value: product?.thickness != null ? `${product.thickness} mm` : 'N/A'
        },
      ]
    }
  ]

  return (
    <Modal 
      isOpen={true}
      onClose={() => window.history.back()}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent 
        maxH="85vh"
        bg={product?.is_valid === false ? "red.50" : "white"}
      >
        <ModalHeader borderBottomWidth="1px">
          <Flex justify="space-between" align="center" width="100%">
            <Box>
              <Text fontSize="xl">
                Product Details
                {product?.is_valid === false && (
                  <Text
                    as="span"
                    color="red.500"
                    fontSize="md"
                    ml={2}
                  >
                    (INVALID)
                  </Text>
                )}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                ID: {product?.id}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" thickness="4px" />
            </Flex>
          ) : product ? (
            <VStack spacing={8} align="stretch">
              {product.is_valid === false && (
                <Alert 
                  status="error"
                  variant="subtle"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Invalid Product Record</AlertTitle>
                    <AlertDescription>
                      This product has been marked as invalid. Some operations may be unavailable.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg={product.is_valid === false ? "white" : "blue.50"}
                shadow="sm"
              >
                <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-around">
                  <Box textAlign="center" mb={{ base: 4, md: 0 }}>
                    <Text color="gray.500" fontSize="sm">Unit Price</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {formatPrice(product.unit_price, product.price_currency)}
                    </Text>
                  </Box>
                  
                  <Divider orientation="vertical" height="70px" display={{ base: "none", md: "block" }} />
                  
                  <Box textAlign="center" mb={{ base: 4, md: 0 }}>
                    <Text color="gray.500" fontSize="sm">Unit Cost</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {formatPrice(product.unit_cost, product.cost_currency)}
                    </Text>
                  </Box>
                  
                  <Divider orientation="vertical" height="70px" display={{ base: "none", md: "block" }} />
                  
                  <Box textAlign="center">
                    <Text color="gray.500" fontSize="sm">Dimensions</Text>
                    <Text fontSize="md" fontWeight="medium">
                      {product.width != null && product.length != null 
                        ? `${product.width}m × ${product.length}m` 
                        : 'N/A'
                      }
                      {product.thickness != null ? ` × ${product.thickness}mm` : ''}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                {productDetails.map((section) => (
                  <Box 
                    key={section.section}
                    opacity={product.is_valid === false ? 0.9 : 1}
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="medium"
                      mb={4}
                      borderBottomWidth="1px"
                      pb={2}
                    >
                      {section.section}
                    </Text>
                    <VStack spacing={4} align="stretch">
                      {section.items.map(({ label, value }) => (
                        <Box 
                          key={label} 
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          bg={product.is_valid === false ? "white" : "inherit"}
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
                            color={product.is_valid === false 
                              ? (value ? "gray.700" : "gray.400")
                              : (value ? "black" : "gray.400")}
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
            </VStack>
          ) : (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Product Not Found</AlertTitle>
              <AlertDescription>
                The requested product could not be found or you don't have permission to view it.
              </AlertDescription>
            </Alert>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
