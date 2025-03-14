// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"
import type {
  AuthGoogleLoginResponse,
  AuthGoogleCallbackResponse,
  AuthHealthCheckResponse,
  CustomersReadCustomerCountData,
  CustomersReadCustomerCountResponse,
  CustomersGetProfileImageData,
  CustomersGetProfileImageResponse,
  CustomersUploadProfileImageData,
  CustomersUploadProfileImageResponse,
  CustomersReadCustomerData,
  CustomersReadCustomerResponse,
  CustomersUpdateCustomerData,
  CustomersUpdateCustomerResponse,
  CustomersDeleteCustomerData,
  CustomersDeleteCustomerResponse,
  CustomersReadCustomersData,
  CustomersReadCustomersResponse,
  CustomersCreateCustomerData,
  CustomersCreateCustomerResponse,
  ItemsReadItemsData,
  ItemsReadItemsResponse,
  ItemsCreateItemData,
  ItemsCreateItemResponse,
  ItemsReadItemData,
  ItemsReadItemResponse,
  ItemsUpdateItemData,
  ItemsUpdateItemResponse,
  ItemsDeleteItemData,
  ItemsDeleteItemResponse,
  LoginLoginAccessTokenData,
  LoginLoginAccessTokenResponse,
  LoginTestTokenResponse,
  LoginRecoverPasswordData,
  LoginRecoverPasswordResponse,
  LoginResetPasswordData,
  LoginResetPasswordResponse,
  LoginRecoverPasswordHtmlContentData,
  LoginRecoverPasswordHtmlContentResponse,
  OrdersGetOrderInvoiceData,
  OrdersGetOrderInvoiceResponse,
  OrdersReadCustomerOrdersCountData,
  OrdersReadCustomerOrdersCountResponse,
  OrdersReadOrderData,
  OrdersReadOrderResponse,
  OrdersUpdateOrderData,
  OrdersUpdateOrderResponse,
  OrdersDeleteOrderData,
  OrdersDeleteOrderResponse,
  OrdersReadOrdersData,
  OrdersReadOrdersResponse,
  OrdersCreateOrderData,
  OrdersCreateOrderResponse,
  PrivateCreateUserData,
  PrivateCreateUserResponse,
  ProductsReadProductCountData,
  ProductsReadProductCountResponse,
  ProductsReadProductData,
  ProductsReadProductResponse,
  ProductsUpdateProductData,
  ProductsUpdateProductResponse,
  ProductsDeleteProductData,
  ProductsDeleteProductResponse,
  ProductsReadProductsData,
  ProductsReadProductsResponse,
  ProductsCreateProductData,
  ProductsCreateProductResponse,
  ProductsGetProductsByNamesData,
  ProductsGetProductsByNamesResponse,
  UsersReadUsersData,
  UsersReadUsersResponse,
  UsersCreateUserData,
  UsersCreateUserResponse,
  UsersReadUserMeResponse,
  UsersDeleteUserMeResponse,
  UsersUpdateUserMeData,
  UsersUpdateUserMeResponse,
  UsersUpdatePasswordMeData,
  UsersUpdatePasswordMeResponse,
  UsersRegisterUserData,
  UsersRegisterUserResponse,
  UsersReadUserByIdData,
  UsersReadUserByIdResponse,
  UsersUpdateUserData,
  UsersUpdateUserResponse,
  UsersDeleteUserData,
  UsersDeleteUserResponse,
  UtilsTestEmailData,
  UtilsTestEmailResponse,
  UtilsHealthCheckResponse,
} from "./types.gen"

export class AuthService {
  /**
   * Google Login
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static googleLogin(): CancelablePromise<AuthGoogleLoginResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/auth/google/login/",
    })
  }

  /**
   * Google Callback
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static googleCallback(): CancelablePromise<AuthGoogleCallbackResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/auth/google/callback/",
    })
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<AuthHealthCheckResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/auth/health-check/",
    })
  }
}

export class CustomersService {
  /**
   * Read Customer Count
   * Retrieve customers only for the count.
   * @param data The data for the request.
   * @param data.displayInvalid
   * @returns CustomerCount Successful Response
   * @throws ApiError
   */
  public static readCustomerCount(
    data: CustomersReadCustomerCountData = {},
  ): CancelablePromise<CustomersReadCustomerCountResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/customers/customer_count",
      query: {
        display_invalid: data.displayInvalid,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get Profile Image
   * @param data The data for the request.
   * @param data.customerId
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static getProfileImage(
    data: CustomersGetProfileImageData,
  ): CancelablePromise<CustomersGetProfileImageResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/customers/get-profile-image/{customer_id}",
      path: {
        customer_id: data.customerId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Upload Profile Image
   * @param data The data for the request.
   * @param data.customerId
   * @param data.formData
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static uploadProfileImage(
    data: CustomersUploadProfileImageData,
  ): CancelablePromise<CustomersUploadProfileImageResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/customers/upload-profile-image/{customer_id}",
      path: {
        customer_id: data.customerId,
      },
      formData: data.formData,
      mediaType: "multipart/form-data",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Customer
   * Get customer by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns Customer Successful Response
   * @throws ApiError
   */
  public static readCustomer(
    data: CustomersReadCustomerData,
  ): CancelablePromise<CustomersReadCustomerResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/customers/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Customer
   * Update a customer.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns CustomerPublic Successful Response
   * @throws ApiError
   */
  public static updateCustomer(
    data: CustomersUpdateCustomerData,
  ): CancelablePromise<CustomersUpdateCustomerResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/customers/{id}",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Customer
   * Delete a customer.
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteCustomer(
    data: CustomersDeleteCustomerData,
  ): CancelablePromise<CustomersDeleteCustomerResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/customers/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Customers
   * Retrieve customers.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @param data.displayInvalid
   * @returns CustomersPublic Successful Response
   * @throws ApiError
   */
  public static readCustomers(
    data: CustomersReadCustomersData = {},
  ): CancelablePromise<CustomersReadCustomersResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/customers/",
      query: {
        skip: data.skip,
        limit: data.limit,
        display_invalid: data.displayInvalid,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Customer
   * Create new customer.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Customer Successful Response
   * @throws ApiError
   */
  public static createCustomer(
    data: CustomersCreateCustomerData,
  ): CancelablePromise<CustomersCreateCustomerResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/customers/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: ItemsReadItemsData = {},
  ): CancelablePromise<ItemsReadItemsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip: data.skip,
        limit: data.limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Item
   * Create new item.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: ItemsCreateItemData,
  ): CancelablePromise<ItemsCreateItemResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Item
   * Get item by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(
    data: ItemsReadItemData,
  ): CancelablePromise<ItemsReadItemResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Item
   * Update an item.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: ItemsUpdateItemData,
  ): CancelablePromise<ItemsUpdateItemResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Item
   * Delete an item.
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(
    data: ItemsDeleteItemData,
  ): CancelablePromise<ItemsDeleteItemResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @param data The data for the request.
   * @param data.formData
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: LoginLoginAccessTokenData,
  ): CancelablePromise<LoginLoginAccessTokenResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: data.formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<LoginTestTokenResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @param data The data for the request.
   * @param data.email
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: LoginRecoverPasswordData,
  ): CancelablePromise<LoginRecoverPasswordResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email: data.email,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: LoginResetPasswordData,
  ): CancelablePromise<LoginResetPasswordResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @param data The data for the request.
   * @param data.email
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: LoginRecoverPasswordHtmlContentData,
  ): CancelablePromise<LoginRecoverPasswordHtmlContentResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email: data.email,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class OrdersService {
  /**
   * Get Order Invoice
   * @param data The data for the request.
   * @param data.orderId
   * @param data.outputCurrency
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static getOrderInvoice(
    data: OrdersGetOrderInvoiceData,
  ): CancelablePromise<OrdersGetOrderInvoiceResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/get-order-invoice/{order_id}",
      path: {
        order_id: data.orderId,
      },
      query: {
        output_currency: data.outputCurrency,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Customer Orders Count
   * Retrieve orders only for the count.
   * Args:
   * start_date: Optional start date in format "YYYY-MM-DD HH:MM:SS"
   * end_date: Optional end date in format "YYYY-MM-DD HH:MM:SS"
   * @param data The data for the request.
   * @param data.displayInvalid
   * @param data.customerId
   * @param data.orderStatus
   * @param data.startDate
   * @param data.endDate
   * @returns OrdersCount Successful Response
   * @throws ApiError
   */
  public static readCustomerOrdersCount(
    data: OrdersReadCustomerOrdersCountData = {},
  ): CancelablePromise<OrdersReadCustomerOrdersCountResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/order_count",
      query: {
        display_invalid: data.displayInvalid,
        customer_id: data.customerId,
        order_status: data.orderStatus,
        start_date: data.startDate,
        end_date: data.endDate,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Order
   * Get order by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns Order Successful Response
   * @throws ApiError
   */
  public static readOrder(
    data: OrdersReadOrderData,
  ): CancelablePromise<OrdersReadOrderResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Order
   * Update an order.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns OrderPublic Successful Response
   * @throws ApiError
   */
  public static updateOrder(
    data: OrdersUpdateOrderData,
  ): CancelablePromise<OrdersUpdateOrderResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/orders/{id}",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Order
   * Delete an order. To mark order invalid
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteOrder(
    data: OrdersDeleteOrderData,
  ): CancelablePromise<OrdersDeleteOrderResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/orders/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Orders
   * Retrieve orders.
   * Args:
   * sort_order: "asc" for ascending, "desc" for descending order by created date
   * start_date: Optional start date in format "YYYY-MM-DD HH:MM:SS"
   * end_date: Optional end date in format "YYYY-MM-DD HH:MM:SS"
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @param data.sortOrder
   * @param data.displayInvalid
   * @param data.customerId
   * @param data.orderStatus
   * @param data.startDate
   * @param data.endDate
   * @returns OrdersPublic Successful Response
   * @throws ApiError
   */
  public static readOrders(
    data: OrdersReadOrdersData = {},
  ): CancelablePromise<OrdersReadOrdersResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/",
      query: {
        skip: data.skip,
        limit: data.limit,
        sort_order: data.sortOrder,
        display_invalid: data.displayInvalid,
        customer_id: data.customerId,
        order_status: data.orderStatus,
        start_date: data.startDate,
        end_date: data.endDate,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Order
   * Create new order.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Order Successful Response
   * @throws ApiError
   */
  public static createOrder(
    data: OrdersCreateOrderData,
  ): CancelablePromise<OrdersCreateOrderResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/orders/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class PrivateService {
  /**
   * Create User
   * Create a new user.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: PrivateCreateUserData,
  ): CancelablePromise<PrivateCreateUserResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/users/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class ProductsService {
  /**
   * Read Product Count
   * Retrieve customers only for the count.
   * @param data The data for the request.
   * @param data.displayInvalid
   * @returns ProductsCount Successful Response
   * @throws ApiError
   */
  public static readProductCount(
    data: ProductsReadProductCountData = {},
  ): CancelablePromise<ProductsReadProductCountResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/product_count",
      query: {
        display_invalid: data.displayInvalid,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Product
   * Get Product by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns Product Successful Response
   * @throws ApiError
   */
  public static readProduct(
    data: ProductsReadProductData,
  ): CancelablePromise<ProductsReadProductResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Product
   * Update a product.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns ProductPublic Successful Response
   * @throws ApiError
   */
  public static updateProduct(
    data: ProductsUpdateProductData,
  ): CancelablePromise<ProductsUpdateProductResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/products/{id}",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Product
   * Delete a product.
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteProduct(
    data: ProductsDeleteProductData,
  ): CancelablePromise<ProductsDeleteProductResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/products/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Products
   * Retrieve products.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @param data.displayInvalid
   * @param data.brand
   * @param data.type
   * @returns ProductsPublic Successful Response
   * @throws ApiError
   */
  public static readProducts(
    data: ProductsReadProductsData = {},
  ): CancelablePromise<ProductsReadProductsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/",
      query: {
        skip: data.skip,
        limit: data.limit,
        display_invalid: data.displayInvalid,
        brand: data.brand,
        type: data.type,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Product
   * Create new product.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Product Successful Response
   * @throws ApiError
   */
  public static createProduct(
    data: ProductsCreateProductData,
  ): CancelablePromise<ProductsCreateProductResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/products/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get Products By Names
   * Get multiple products by their names in a single request.
   *
   * Accepts a JSON string containing a list of product names and returns information for all found products.
   * Products that don't exist will be silently skipped.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns ProductsPublic Successful Response
   * @throws ApiError
   */
  public static getProductsByNames(
    data: ProductsGetProductsByNamesData,
  ): CancelablePromise<ProductsGetProductsByNamesResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/products/batch-by-names",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: UsersReadUsersData = {},
  ): CancelablePromise<UsersReadUsersResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip: data.skip,
        limit: data.limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create User
   * Create new user.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: UsersCreateUserData,
  ): CancelablePromise<UsersCreateUserResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UsersReadUserMeResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<UsersDeleteUserMeResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Update User Me
   * Update own user.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: UsersUpdateUserMeData,
  ): CancelablePromise<UsersUpdateUserMeResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Password Me
   * Update own password.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: UsersUpdatePasswordMeData,
  ): CancelablePromise<UsersUpdatePasswordMeResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: UsersRegisterUserData,
  ): CancelablePromise<UsersRegisterUserResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @param data The data for the request.
   * @param data.userId
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: UsersReadUserByIdData,
  ): CancelablePromise<UsersReadUserByIdResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: data.userId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update User
   * Update a user.
   * @param data The data for the request.
   * @param data.userId
   * @param data.requestBody
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: UsersUpdateUserData,
  ): CancelablePromise<UsersUpdateUserResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: data.userId,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete User
   * Delete a user.
   * @param data The data for the request.
   * @param data.userId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(
    data: UsersDeleteUserData,
  ): CancelablePromise<UsersDeleteUserResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: data.userId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @param data The data for the request.
   * @param data.emailTo
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(
    data: UtilsTestEmailData,
  ): CancelablePromise<UtilsTestEmailResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: data.emailTo,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<UtilsHealthCheckResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check/",
    })
  }
}
