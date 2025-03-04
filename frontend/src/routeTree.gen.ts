/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignupImport } from './routes/signup'
import { Route as ResetPasswordImport } from './routes/reset-password'
import { Route as RecoverPasswordImport } from './routes/recover-password'
import { Route as LoginImport } from './routes/login'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutIndexImport } from './routes/_layout/index'
import { Route as LayoutSettingsImport } from './routes/_layout/settings'
import { Route as LayoutProductsImport } from './routes/_layout/products'
import { Route as LayoutOrdersImport } from './routes/_layout/orders'
import { Route as LayoutItemsImport } from './routes/_layout/items'
import { Route as LayoutCustomersImport } from './routes/_layout/customers'
import { Route as LayoutAdminImport } from './routes/_layout/admin'
import { Route as LayoutProductsProductIdImport } from './routes/_layout/products/$productId'
import { Route as LayoutOrdersOrderIdImport } from './routes/_layout/orders/$orderId'
import { Route as LayoutDashboardOrderAnalysisImport } from './routes/_layout/dashboard/$orderAnalysis'
import { Route as LayoutCustomersCustomerIdImport } from './routes/_layout/customers/$customerId'

// Create/Update Routes

const SignupRoute = SignupImport.update({
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any)

const ResetPasswordRoute = ResetPasswordImport.update({
  path: '/reset-password',
  getParentRoute: () => rootRoute,
} as any)

const RecoverPasswordRoute = RecoverPasswordImport.update({
  path: '/recover-password',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutIndexRoute = LayoutIndexImport.update({
  path: '/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutSettingsRoute = LayoutSettingsImport.update({
  path: '/settings',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutProductsRoute = LayoutProductsImport.update({
  path: '/products',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutOrdersRoute = LayoutOrdersImport.update({
  path: '/orders',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutItemsRoute = LayoutItemsImport.update({
  path: '/items',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutCustomersRoute = LayoutCustomersImport.update({
  path: '/customers',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutAdminRoute = LayoutAdminImport.update({
  path: '/admin',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutProductsProductIdRoute = LayoutProductsProductIdImport.update({
  path: '/$productId',
  getParentRoute: () => LayoutProductsRoute,
} as any)

const LayoutOrdersOrderIdRoute = LayoutOrdersOrderIdImport.update({
  path: '/$orderId',
  getParentRoute: () => LayoutOrdersRoute,
} as any)

const LayoutDashboardOrderAnalysisRoute =
  LayoutDashboardOrderAnalysisImport.update({
    path: '/dashboard/$orderAnalysis',
    getParentRoute: () => LayoutRoute,
  } as any)

const LayoutCustomersCustomerIdRoute = LayoutCustomersCustomerIdImport.update({
  path: '/$customerId',
  getParentRoute: () => LayoutCustomersRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/recover-password': {
      preLoaderRoute: typeof RecoverPasswordImport
      parentRoute: typeof rootRoute
    }
    '/reset-password': {
      preLoaderRoute: typeof ResetPasswordImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      preLoaderRoute: typeof SignupImport
      parentRoute: typeof rootRoute
    }
    '/_layout/admin': {
      preLoaderRoute: typeof LayoutAdminImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/customers': {
      preLoaderRoute: typeof LayoutCustomersImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/items': {
      preLoaderRoute: typeof LayoutItemsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/orders': {
      preLoaderRoute: typeof LayoutOrdersImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/products': {
      preLoaderRoute: typeof LayoutProductsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/settings': {
      preLoaderRoute: typeof LayoutSettingsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/': {
      preLoaderRoute: typeof LayoutIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/customers/$customerId': {
      preLoaderRoute: typeof LayoutCustomersCustomerIdImport
      parentRoute: typeof LayoutCustomersImport
    }
    '/_layout/dashboard/$orderAnalysis': {
      preLoaderRoute: typeof LayoutDashboardOrderAnalysisImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/orders/$orderId': {
      preLoaderRoute: typeof LayoutOrdersOrderIdImport
      parentRoute: typeof LayoutOrdersImport
    }
    '/_layout/products/$productId': {
      preLoaderRoute: typeof LayoutProductsProductIdImport
      parentRoute: typeof LayoutProductsImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  LayoutRoute.addChildren([
    LayoutAdminRoute,
    LayoutCustomersRoute.addChildren([LayoutCustomersCustomerIdRoute]),
    LayoutItemsRoute,
    LayoutOrdersRoute.addChildren([LayoutOrdersOrderIdRoute]),
    LayoutProductsRoute.addChildren([LayoutProductsProductIdRoute]),
    LayoutSettingsRoute,
    LayoutIndexRoute,
    LayoutDashboardOrderAnalysisRoute,
  ]),
  LoginRoute,
  RecoverPasswordRoute,
  ResetPasswordRoute,
  SignupRoute,
])

/* prettier-ignore-end */
