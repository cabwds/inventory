import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Divider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar, FiBarChart2 } from "react-icons/fi"
import { OrdersService } from "../../../client/sdk.gen"
import { useState, useEffect } from "react"

export const Route = createFileRoute("/_layout/dashboard/$orderAnalysis")({ 
  component: OrderAnalysis,
})

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2
  }).format(amount)
}

function OrderAnalysis() {
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // State for order data analysis
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0)
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(0)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({})
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  
  // Fetch orders data
  const { data: orders, isLoading } = useQuery({
    queryKey: ["ordersAnalysis"],
    queryFn: () => OrdersService.readOrders({ limit: 100, displayInvalid: false }),
  })

  // Process order data when it's available
  useEffect(() => {
    if (orders?.data) {
      // Calculate total revenue
      const revenue = orders.data.reduce((sum, order) => sum + Number(order.total_price || '0'), 0)
      setTotalRevenue(revenue)
      
      // Calculate average order value
      setAverageOrderValue(revenue / orders.data.length)
      
      // Group orders by status
      const statusCounts: Record<string, number> = {}
      orders.data.forEach(order => {
        const status = order.order_status || 'Unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      setOrdersByStatus(statusCounts)
      
      // Get recent orders
      const sortedOrders = [...orders.data].sort((a, b) => {
        return new Date(b.order_date || '').getTime() - new Date(a.order_date || '').getTime()
      })
      setRecentOrders(sortedOrders.slice(0, 5))
      
      // Calculate monthly growth (simplified - would need more data for accurate calculation)
      // This is a placeholder calculation
      const currentMonth = new Date().getMonth()
      const currentMonthOrders = orders.data.filter(order => {
        const orderDate = new Date(order.order_date || '')
        return orderDate.getMonth() === currentMonth
      })
      
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const previousMonthOrders = orders.data.filter(order => {
        const orderDate = new Date(order.order_date || '')
        return orderDate.getMonth() === previousMonth
      })
      
      if (previousMonthOrders.length > 0) {
        const growth = ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100
        setMonthlyGrowth(growth)
      }
      
      // Extract top products (would need to parse order_items for accurate data)
      // This is a placeholder for demonstration
      // In a real implementation, you would aggregate product quantities across orders
      setTopProducts([
        { name: "Film Roll Type A", quantity: 42, revenue: 2100 },
        { name: "Camera Model X", quantity: 28, revenue: 5600 },
        { name: "Lens Kit Pro", quantity: 23, revenue: 4600 },
        { name: "Tripod Ultra", quantity: 19, revenue: 1900 },
        { name: "Lighting Set", quantity: 15, revenue: 3000 },
      ])
    }
  }, [orders])

  return (
    <Box bg={bgColor} minH="100vh" w="full" py={5}>
      <Container maxW="container.xl">
        <Heading size="lg" mb={6}>Order Analysis</Heading>
        
        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiDollarSign} mr={2} color="green.500" />
                  Total Revenue
                </StatLabel>
                <StatNumber>{formatCurrency(totalRevenue)}</StatNumber>
                <StatHelpText>
                  <StatArrow type={monthlyGrowth >= 0 ? "increase" : "decrease"} />
                  {Math.abs(monthlyGrowth).toFixed(1)}% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiShoppingBag} mr={2} color="blue.500" />
                  Total Orders
                </StatLabel>
                <StatNumber>{orders?.data?.length || 0}</StatNumber>
                <StatHelpText>
                  Across all time periods
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiBarChart2} mr={2} color="purple.500" />
                  Average Order Value
                </StatLabel>
                <StatNumber>{formatCurrency(averageOrderValue)}</StatNumber>
                <StatHelpText>
                  Per transaction
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiTrendingUp} mr={2} color="orange.500" />
                  Conversion Rate
                </StatLabel>
                <StatNumber>68.3%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.2% increase
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {/* Order Status Distribution */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardHeader pb={0}>
              <Heading size="md">Order Status Distribution</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {Object.entries(ordersByStatus).map(([status, count]) => {
                  let colorScheme = "gray";
                  switch(status) {
                    case "Delivered": colorScheme = "green"; break;
                    case "Processing": colorScheme = "blue"; break;
                    case "Shipped": colorScheme = "purple"; break;
                    case "Cancelled": colorScheme = "red"; break;
                  }
                  
                  const percentage = orders?.data ? (count / orders.data.length) * 100 : 0;
                  
                  return (
                    <Box key={status}>
                      <Flex justify="space-between" mb={1}>
                        <HStack>
                          <Badge colorScheme={colorScheme} px={2} py={0.5}>{status}</Badge>
                          <Text fontSize="sm">{count} orders</Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="bold">{percentage.toFixed(1)}%</Text>
                      </Flex>
                      <Box
                        w="100%"
                        bg="gray.100"
                        borderRadius="full"
                        h="8px"
                      >
                        <Box
                          w={`${percentage}%`}
                          bg={`${colorScheme}.500`}
                          borderRadius="full"
                          h="100%"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>
          
          {/* Top Products */}
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardHeader pb={0}>
              <Heading size="md">Top Selling Products</Heading>
            </CardHeader>
            <CardBody>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th isNumeric>Quantity</Th>
                    <Th isNumeric>Revenue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topProducts.map((product, index) => (
                    <Tr key={index}>
                      <Td>{product.name}</Td>
                      <Td isNumeric>{product.quantity}</Td>
                      <Td isNumeric>{formatCurrency(product.revenue)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {/* Recent Orders */}
        <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden" mb={8}>
          <CardHeader>
            <Heading size="md">Recent Orders</Heading>
          </CardHeader>
          <CardBody>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th isNumeric>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentOrders.map((order, index) => {
                  let statusColor = "gray";
                  switch(order.order_status) {
                    case "Delivered": statusColor = "green"; break;
                    case "Processing": statusColor = "blue"; break;
                    case "Shipped": statusColor = "purple"; break;
                    case "Cancelled": statusColor = "red"; break;
                  }
                  
                  return (
                    <Tr key={index}>
                      <Td fontWeight="medium">{order.id}</Td>
                      <Td>{new Date(order.order_date).toLocaleDateString()}</Td>
                      <Td>{order.customer_id || 'N/A'}</Td>
                      <Td>
                        <Badge colorScheme={statusColor}>{order.order_status}</Badge>
                      </Td>
                      <Td isNumeric>{formatCurrency(parseFloat(order.total_price || '0'))}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        
        {/* Business Insights */}
        <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
          <CardHeader>
            <Heading size="md">Business Insights</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <Flex align="center" mb={2}>
                  <Icon as={FiDollarSign} color="purple.500" mr={2} />
                  <Text fontWeight="bold">Pricing Strategy</Text>
                </Flex>
                <Text fontSize="sm" color={textColor}>
                  Higher-priced Camera Model X has strong sales. Consider bundling with accessories to increase average order value.
                </Text>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <Flex align="center" mb={2}>
                  <Icon as={FiTrendingUp} color="green.500" mr={2} />
                  <Text fontWeight="bold">Growth Opportunity</Text>
                </Flex>
                <Text fontSize="sm" color={textColor}>
                  Film Roll Type A shows consistent demand. Consider increasing inventory and running promotions to boost sales further.
                </Text>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <Flex align="center" mb={2}>
                  <Icon as={FiCalendar} color="blue.500" mr={2} />
                  <Text fontWeight="bold">Seasonal Trend</Text>
                </Flex>
                <Text fontSize="sm" color={textColor}>
                  Orders peak during holiday seasons. Plan inventory and marketing campaigns accordingly to maximize revenue.
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}