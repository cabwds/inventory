import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Box,
  SimpleGrid,
  Button,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Tooltip,
  Grid,
  GridItem,
  Tag,
} from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { OrdersService, CustomersService, ProductsService } from "../../../client"
import useCustomToast from "../../../hooks/useCustomToast"
import { modalScrollbarStyles } from "../../../styles/orders.styles"
import { useEffect, useState } from "react"
import { FaExternalLinkAlt, FaTag, FaCheckCircle, FaTimesCircle, FaClock, FaShippingFast, FaDollarSign } from "react-icons/fa"

export const Route = createFileRoute('/_layout/orders/$orderId')({
  component: OrderDetail,
})

// Define interface for parsed order items
interface OrderItem {
  product_id: string;
  quantity: number;
  product_name?: string;  // Added to store name from products data
  product_brand?: string; // Added to store brand from products data
  product_type?: string;  // Added to store type from products data
  unit_price?: number;    // Added to store unit price from products data
  price_currency?: string; // Added to store price currency
  total_price?: number;   // Added to store calculated total price
}

// Status color mapping for visual indicators
const STATUS_COLORS = {
  "Pending": "yellow",
  "Processing": "blue",
  "Shipped": "purple",
  "Delivered": "green",
  "Cancelled": "red",
  "Paid": "green",
  "Failed": "red",
  "Refunded": "orange"
};

function OrderDetail() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const showToast = useCustomToast()
  const [customerCompany, setCustomerCompany] = useState<string>('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [totalQuantity, setTotalQuantity] = useState<number>(0)
  const [formattedDate, setFormattedDate] = useState<string>('N/A')

  const { data: order, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrdersService.readOrder({ id: orderId }),
  })

  // Fetch products to get product details
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductsService.readProducts({ limit: 100 }),
    enabled: !!order?.order_items, // Only fetch if order_items exists
  })
  
  // Parse order items when order data is available
  useEffect(() => {
    if (order?.order_items && products) {
      try {
        const orderItemsObj = JSON.parse(order.order_items);
        const parsedItems = Object.entries(orderItemsObj).map(([product_id, quantity]) => {
          // Find product data from products data
          const productData = products.data.find(p => p.id === product_id);
          const unitPrice = productData?.unit_price || 0;
          return {
            product_id,
            quantity: Number(quantity),
            product_name: productData?.id || 'Deleted Product',
            product_brand: productData?.brand || '',
            product_type: productData?.type || '',
            unit_price: unitPrice,
            price_currency: productData?.price_currency || 'USD',
            total_price: unitPrice * Number(quantity)
          };
        });
        setOrderItems(parsedItems);
        
        // Calculate total quantity
        const totalQty = parsedItems.reduce((sum, item) => sum + item.quantity, 0);
        setTotalQuantity(totalQty);
      } catch (e) {
        console.error("Error parsing order items:", e);
        setOrderItems([]);
        setTotalQuantity(0);
      }
    } else {
      setOrderItems([]);
      setTotalQuantity(0);
    }
  }, [order?.order_items, products]);

  // Format the order date for better display
  useEffect(() => {
    if (order?.order_date) {
      try {
        const date = new Date(order.order_date);
        setFormattedDate(date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      } catch (e) {
        setFormattedDate(order.order_date || 'N/A');
      }
    }
  }, [order?.order_date]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (order?.customer_id) {
        try {
          const customerData = await CustomersService.readCustomer({
            id: order.customer_id
          });
          setCustomerCompany(customerData.company || 'N/A');
        } catch (error) {
          showToast("Error", "Failed to fetch customer details", "error");
          setCustomerCompany('N/A');
        }
      }
    };

    fetchCustomerDetails();
  }, [order?.customer_id, showToast]);

  if (isError) {
    showToast("Error", "Failed to load order details", "error")
  }

  const handleCustomerClick = () => {
    if (order?.customer_id) {
      navigate({ 
        to: '/customers/$customerId', 
        params: { customerId: order.customer_id } 
      })
    }
  }

  const handleProductClick = (productId: string) => {
    navigate({ 
      to: '/products/$productId', 
      params: { productId: productId } 
    })
  }

  // Get the maximum quantity for progress bar scaling
  const maxQuantity = Math.max(...orderItems.map(item => item.quantity), 1);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency?: string) => {
    if (!currency) return '$';
    
    switch (currency.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  // Render the order summary cards
  const renderOrderSummary = () => {
    if (!order) return null;
    
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card variant="outline">
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaTag} mr={2} color="blue.500" />
                Order Status
              </StatLabel>
              <Flex align="center" mt={2}>
                <Badge 
                  colorScheme={STATUS_COLORS[order.order_status as keyof typeof STATUS_COLORS] || "gray"}
                  px={2} py={1} borderRadius="md"
                  display="flex" alignItems="center"
                >
                  {order.order_status === "Delivered" && <Icon as={FaCheckCircle} mr={1} />}
                  {order.order_status === "Cancelled" && <Icon as={FaTimesCircle} mr={1} />}
                  {order.order_status === "Processing" && <Icon as={FaClock} mr={1} />}
                  {order.order_status === "Shipped" && <Icon as={FaShippingFast} mr={1} />}
                  {order.order_status}
                </Badge>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
        
        <Card variant="outline">
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaDollarSign} mr={2} color="green.500" />
                Payment Status
              </StatLabel>
              <Flex align="center" mt={2}>
                <Badge 
                  colorScheme={STATUS_COLORS[order.payment_status as keyof typeof STATUS_COLORS] || "gray"}
                  px={2} py={1} borderRadius="md"
                >
                  {order.payment_status}
                </Badge>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
        
        <Card variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber>${order.total_price}</StatNumber>
              <StatHelpText>
                {orderItems.length} product{orderItems.length !== 1 ? 's' : ''} ({totalQuantity} unit{totalQuantity !== 1 ? 's' : ''})
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    );
  };

  // Render the order items with improved visualization
  const renderOrderItems = () => {
    if (orderItems.length === 0) {
      return <Text color="gray.500">No items in this order</Text>;
    }

    return (
      <Box overflowX="auto">
        <Table size="sm" variant="simple" colorScheme="blue">
          <Thead bg="blue.50">
            <Tr>
              <Th>Product</Th>
              <Th>Quantity</Th>
              <Th>Unit Price</Th>
              <Th>Total</Th>
              <Th>Distribution</Th>
              <Th width="100px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orderItems.map((item, index) => (
              <Tr 
                key={index} 
                _hover={{ bg: "gray.50" }}
                transition="background-color 0.2s"
              >
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{item.product_name}</Text>
                    {(item.product_brand || item.product_type) && (
                      <Text fontSize="xs" color="gray.600">
                        {[item.product_brand, item.product_type].filter(Boolean).join(' - ')}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <Tag size="md" colorScheme="blue" borderRadius="full">
                    {item.quantity}
                  </Tag>
                </Td>
                <Td>
                  {getCurrencySymbol(item.price_currency)}{item.unit_price?.toFixed(2) || '0.00'}
                </Td>
                <Td fontWeight="medium" color="green.600">
                  {getCurrencySymbol(item.price_currency)}{item.total_price?.toFixed(2) || '0.00'}
                </Td>
                <Td>
                  <Tooltip label={`${Math.round((item.quantity / totalQuantity) * 100)}% of total order`}>
                    <Box width="100%">
                      <Progress 
                        value={(item.quantity / totalQuantity) * 100} 
                        max={100} 
                        size="sm" 
                        colorScheme="blue" 
                        borderRadius="full" 
                      />
                    </Box>
                  </Tooltip>
                </Td>
                <Td>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    rightIcon={<Icon as={FaExternalLinkAlt} boxSize="10px" />}
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  // Render customer information in a card
  const renderCustomerInfo = () => {
    if (!order) return null;
    
    return (
      <Card variant="outline" mb={6}>
        <CardHeader pb={0}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="semibold" fontSize="md">Customer Information</Text>
            {order?.customer_id && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                rightIcon={<Icon as={FaExternalLinkAlt} boxSize="12px" />}
                onClick={handleCustomerClick}
              >
                View Customer
              </Button>
            )}
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.600">Company</Text>
              <Text fontWeight="medium">{customerCompany}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Order Date</Text>
              <Text fontWeight="medium">{formattedDate}</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  };
  
  // Render notes in a card
  const renderNotes = () => {
    if (!order) return null;
    
    return (
      <Card variant="outline" mt={6}>
        <CardHeader pb={0}>
          <Text fontWeight="semibold" fontSize="md">Notes</Text>
        </CardHeader>
        <CardBody>
          <Text whiteSpace="pre-wrap">
            {order.notes || 'No notes available for this order.'}
          </Text>
        </CardBody>
      </Card>
    );
  };

  return (
    <Modal 
      isOpen={true}
      onClose={() => navigate({ to: '/orders' })}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent 
        maxH="85vh"
        bg={order?.is_valid === false ? "red.50" : "white"}
      >
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="xl">
                Order Details
                {order?.is_valid === false && (
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
              <HStack spacing={4} mt={1}>
                <Text fontSize="sm" color="gray.600">
                  ID: {order?.id}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Last Updated: {order?.order_update_date 
                    ? new Date(order.order_update_date).toLocaleDateString() 
                    : 'N/A'}
                </Text>
              </HStack>
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
          {order && (
            <VStack spacing={6} align="stretch">
              {order.is_valid === false && (
                <Alert 
                  status="error"
                  variant="subtle"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Invalid Order Record</AlertTitle>
                    <AlertDescription>
                      This order has been marked as invalid. Some information may be unavailable.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {/* Order Summary Cards */}
              {renderOrderSummary()}
              
              {/* Customer Information */}
              {renderCustomerInfo()}
              
              {/* Order Items Card */}
              <Card variant="outline">
                <CardHeader pb={2}>
                  <Text fontWeight="semibold" fontSize="md">Order Items</Text>
                </CardHeader>
                <CardBody pt={0}>
                  {renderOrderItems()}
                </CardBody>
              </Card>
              
              {/* Notes Section */}
              {renderNotes()}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 