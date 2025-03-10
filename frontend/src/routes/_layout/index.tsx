import {
  Box,
  Container,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { FiUsers, FiShoppingBag, FiPackage } from "react-icons/fi"

import useAuth from "../../hooks/useAuth"
import { CustomersService, OrdersService, ProductsService } from "../../client/sdk.gen"
import { dashboardStyles, getStatCardStyles } from "../../styles/dashboard"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function StatCard({ 
  title, 
  value, 
  icon, 
  helpText,
  onClick
}: { 
  title: string
  value: string | number
  icon: React.ElementType
  helpText?: string
  onClick?: () => void
}) {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const iconBg = useColorModeValue('blue.100', 'blue.900')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  const styles = getStatCardStyles(bgColor, borderColor, iconBg, textColor)

  return (
    <Stat {...styles.stat} onClick={onClick} cursor={onClick ? "pointer" : "default"} _hover={onClick ? { transform: "translateY(-2px)", transition: "transform 0.2s" } : undefined}>
      <Flex {...styles.statContent}>
        <Box {...styles.textContainer}>
          <StatLabel {...styles.label}>
            {title}
          </StatLabel>
          <StatNumber {...styles.number}>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText {...styles.helpText}>
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box {...styles.iconContainer}>
          <Flex {...styles.iconWrapper}>
            <Icon as={icon} {...styles.icon} />
          </Flex>
        </Box>
      </Flex>
    </Stat>
  )
}

function Dashboard() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  // Fetch customer count
  const { data: customerCount } = useQuery({
    queryKey: ["customerCount"],
    queryFn: () => CustomersService.readCustomerCount({ displayInvalid: false }),
  })

  // Fetch order count (only valid orders)
  const { data: orderCount } = useQuery({
    queryKey: ["orderCount"],
    queryFn: () => OrdersService.readCustomerOrdersCount({ displayInvalid: false }),
  })

  // Fetch product count (only valid products)
  const { data: productCount } = useQuery({
    queryKey: ["productCount"],
    queryFn: () => ProductsService.readProductCount({ displayInvalid: false }),
  })

  return (
    <Box bg={bgColor} minH="100vh" w="full">
      <Container {...dashboardStyles.container}>
        <Box {...dashboardStyles.welcomeBox}>
          <Text {...dashboardStyles.welcomeText}>
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>
          <Text color={textColor}>
            Welcome back, here's an overview of your business
          </Text>
        </Box>

        <SimpleGrid {...dashboardStyles.statsGrid}>
          <StatCard
            title="Total Customers"
            value={customerCount?.count ?? "Loading..."}
            icon={FiUsers}
            helpText="Active customers in your database"
          />
          <StatCard
            title="Valid Orders"
            value={orderCount?.count ?? "Loading..."}
            icon={FiShoppingBag}
            helpText="Total number of valid orders"
            onClick={() => navigate({ to: "/dashboard/orderAnalysis" })}
          />
          <StatCard
            title="Product Inventory"
            value={productCount?.count ?? "Loading..."}
            icon={FiPackage}
            helpText="Active products in your catalog"
          />
        </SimpleGrid>
      </Container>
    </Box>
  )
}
