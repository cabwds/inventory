import React from "react"
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
  Tooltip,
  Select,
  Button,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar, FiBarChart2, FiChevronDown } from "react-icons/fi"
import { OrdersService, CustomersService } from "../../../client/sdk.gen"
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
  const [conversionRate, setConversionRate] = useState<number>(0)
  const [conversionGrowth, setConversionGrowth] = useState<number>(0)
  const [customerCompanies, setCustomerCompanies] = useState<Record<string, string>>({})
  const [customerSegments, setCustomerSegments] = useState<Record<string, number>>({})
  const [seasonalTrends, setSeasonalTrends] = useState<Record<string, number>>({})
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  
  // Time range state
  const [timeRange, setTimeRange] = useState<string>("last12Months")
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  
  // Fetch orders data
  const { data: orders, isLoading } = useQuery({
    queryKey: ["ordersAnalysis", timeRange, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => OrdersService.readOrders({ limit: 500, displayInvalid: false }),
  })

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await CustomersService.readCustomers({ limit: 500 })
        const companies: Record<string, string> = {}
        response.data.forEach(customer => {
          companies[customer.id] = customer.company || 'N/A'
        })
        setCustomerCompanies(companies)
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  // Handle time range changes
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    const now = new Date()
    let start = new Date()
    
    switch(value) {
      case "last30Days":
        start.setDate(now.getDate() - 30)
        break
      case "last90Days":
        start.setDate(now.getDate() - 90)
        break
      case "last6Months":
        start.setMonth(now.getMonth() - 6)
        break
      case "last12Months":
        start.setMonth(now.getMonth() - 12)
        break
      case "yearToDate":
        start = new Date(now.getFullYear(), 0, 1) // January 1st of current year
        break
      case "lastYear":
        start = new Date(now.getFullYear() - 1, 0, 1) // January 1st of last year
        const endLastYear = new Date(now.getFullYear() - 1, 11, 31) // December 31st of last year
        setEndDate(endLastYear)
        break
      case "allTime":
        start = new Date(2000, 0, 1) // Far in the past to include all orders
        break
      default:
        start.setMonth(now.getMonth() - 12) // Default to last 12 months
    }
    
    setStartDate(start)
    if (value !== "lastYear") {
      setEndDate(now)
    }
  }

  // Process order data when it's available
  useEffect(() => {
    if (orders?.data) {
      // Filter orders by selected date range
      const filtered = orders.data.filter(order => {
        if (!order.order_date) return false
        const orderDate = new Date(order.order_date)
        return orderDate >= startDate && orderDate <= endDate
      })
      setFilteredOrders(filtered)
      
      // Calculate total revenue
      const revenue = filtered.reduce((sum, order) => sum + Number(order.total_price || '0'), 0)
      setTotalRevenue(revenue)
      
      // Calculate average order value
      setAverageOrderValue(filtered.length > 0 ? revenue / filtered.length : 0)
      
      // Group orders by status
      const statusCounts: Record<string, number> = {}
      filtered.forEach(order => {
        const status = order.order_status || 'Unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      setOrdersByStatus(statusCounts)
      
      // Get recent orders
      const sortedOrders = [...filtered].sort((a, b) => {
        return new Date(b.order_date || '').getTime() - new Date(a.order_date || '').getTime()
      })
      setRecentOrders(sortedOrders.slice(0, 5))
      
      // Calculate period metrics for growth comparison
      const currentDate = new Date()
      
      // Determine comparison periods based on selected time range
      let currentPeriodStart, previousPeriodStart
      const periodLength = endDate.getTime() - startDate.getTime()
      
      currentPeriodStart = new Date(startDate)
      previousPeriodStart = new Date(startDate)
      previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength)
      
      const currentPeriodOrders = filtered
      const previousPeriodOrders = orders.data.filter(order => {
        if (!order.order_date) return false
        const orderDate = new Date(order.order_date)
        return orderDate >= previousPeriodStart && orderDate < startDate
      })
      
      // Calculate period-over-period growth
      if (previousPeriodOrders.length > 0) {
        const growth = ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
        setMonthlyGrowth(growth)
      } else {
        setMonthlyGrowth(0)
      }
      
      // Calculate conversion rate (completed orders / total orders)
      const completedOrders = filtered.filter(order => order.order_status === 'Delivered').length
      const conversionRateValue = filtered.length > 0 ? (completedOrders / filtered.length) * 100 : 0
      setConversionRate(conversionRateValue)
      
      // Calculate conversion rate growth
      const previousCompletedOrders = previousPeriodOrders.filter(order => order.order_status === 'Delivered').length
      if (previousPeriodOrders.length > 0) {
        const previousConversionRate = (previousCompletedOrders / previousPeriodOrders.length) * 100
        const conversionGrowthValue = conversionRateValue - previousConversionRate
        setConversionGrowth(conversionGrowthValue)
      } else {
        setConversionGrowth(0)
      }

      // Analyze customer segments by order frequency
      const customerOrderCounts: Record<string, number> = {}
      filtered.forEach(order => {
        if (order.customer_id) {
          customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1
        }
      })
      const segments: Record<string, number> = {
        'High Volume (>10)': 0,
        'Medium Volume (5-10)': 0,
        'Low Volume (<5)': 0
      }
      Object.values(customerOrderCounts).forEach(count => {
        if (count > 10) segments['High Volume (>10)']++
        else if (count >= 5) segments['Medium Volume (5-10)']++
        else segments['Low Volume (<5)']++
      })
      setCustomerSegments(segments)

      // Analyze seasonal trends
      const monthlyOrders: Record<string, number> = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      filtered.forEach(order => {
        if (order.order_date) {
          const orderDate = new Date(order.order_date)
          const monthKey = months[orderDate.getMonth()]
          monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1
        }
      })
      setSeasonalTrends(monthlyOrders)
    }
  }, [orders, startDate, endDate])

  return (
    <Box bg={bgColor} minH="100vh" w="full" py={5}>
      <Container maxW="container.xl">
        <Heading size="lg" mb={2}>Order Analysis</Heading>
        
        {/* Time Range Selector */}
        <Box mb={6} p={4} bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <FormControl>
            <FormLabel fontWeight="medium">Time Range</FormLabel>
            <Select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              width={{ base: "full", md: "300px" }}
              mb={2}
            >
              <option value="custom">Custom Range</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="last90Days">Last 90 Days</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="last12Months">Last 12 Months</option>
              <option value="yearToDate">Year to Date</option>
              <option value="lastYear">Last Year</option>
              <option value="allTime">All Time</option>
            </Select>
            {timeRange === 'custom' ? (
              <HStack spacing={4} mt={2}>
                <FormControl>
                  <FormLabel fontSize="sm">Start Date</FormLabel>
                  <Input
                    type="date"
                    value={startDate.toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    max={endDate.toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">End Date</FormLabel>
                  <Input
                    type="date"
                    value={endDate.toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    min={startDate.toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
              </HStack>
            ) : (
              <Text fontSize="sm" color={textColor}>
                Showing data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
              </Text>
            )}
          </FormControl>
        </Box>
        
        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
          <Tooltip label="Total revenue generated from all orders" placement="top">
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiDollarSign} mr={2} color="green.500" />
                  Total Revenue
                </StatLabel>
                <StatNumber>S{formatCurrency(totalRevenue)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          </Tooltip>
          
          <Tooltip label="Total number of orders placed across all time periods" placement="top">
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiShoppingBag} mr={2} color="blue.500" />
                  Total Orders
                </StatLabel>
                <StatNumber>{filteredOrders.length || 0}</StatNumber>
                <StatHelpText>
                  In selected time range
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          </Tooltip>
          
          <Tooltip label="Average amount spent per order (Total Revenue ÷ Total Orders)" placement="top">
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiBarChart2} mr={2} color="purple.500" />
                  Average Order Value
                </StatLabel>
                <StatNumber>S{formatCurrency(averageOrderValue)}</StatNumber>
                <StatHelpText>
                  Per transaction
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          </Tooltip>
          
          <Tooltip label="Percentage of orders that have been successfully delivered (Delivered Orders ÷ Total Orders). This metric indicates the efficiency of order fulfillment." placement="top">
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center">
                  <Icon as={FiTrendingUp} mr={2} color="orange.500" />
                  Conversion Rate 
                </StatLabel>
                <StatNumber>{conversionRate.toFixed(1)}%</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          </Tooltip>
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
        
        {/* Additional Insights */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
          {/* Seasonal Trends */}
          <Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardHeader pb={0}>
              <Heading size="md">Seasonal Order Trends</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                {Object.entries(seasonalTrends).map(([month, count]) => {
                  const maxOrders = Math.max(...Object.values(seasonalTrends), 1)
                  const percentage = (count / maxOrders) * 100
                  return (
                    <Box key={month}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm">{month}</Text>
                        <Text fontSize="sm">{count} orders</Text>
                      </Flex>
                      <Box w="100%" bg="gray.100" borderRadius="full" h="6px">
                        <Box
                          w={`${percentage}%`}
                          bg="green.500"
                          borderRadius="full"
                          h="100%"
                        />
                      </Box>
                    </Box>
                  )
                })}
              </VStack>
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
                      <Td>{customerCompanies[order.customer_id] || 'N/A'}</Td>
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
      
      </Container>
    </Box>
  )
}