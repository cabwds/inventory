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
    } from "@chakra-ui/react"
import { z } from "zod"
import Navbar from "../../components/Common/Navbar"

import useAuth from "../../hooks/useAuth"
import { createFileRoute } from "@tanstack/react-router"

const itemsSearchSchema = z.object({
    page: z.number().catch(1),
  })

export const Route = createFileRoute("/_layout/customers")({
  component: Customers,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})


function Customers() {
    const { user: currentUser } = useAuth()
  
    return (
        <Container maxW="full">
          <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Customer Management
          </Heading>

        </Container>
      )
  }