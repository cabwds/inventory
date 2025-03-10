import { ChakraProvider } from "@chakra-ui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"
import React from "react"
//import { StrictMode } from "react"
import { OpenAPI } from "./client"
import theme from "./theme"
import { initializeCurrencyService } from "./utils/currencyUtils"

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

// Initialize currency service to fetch latest rates
initializeCurrencyService()

const queryClient = new QueryClient()

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
