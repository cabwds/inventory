// This file is auto-generated by @hey-api/openapi-ts

export type Body_customers_upload_profile_image = {
  file: Blob | File
}

export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type Customer = {
  company?: string
  description?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  gender?: string | null
  preferred_language?: string | null
  address?: string | null
  is_valid?: boolean | null
  id?: string
}

export type CustomerCount = {
  count: number
}

export type CustomerCreate = {
  company?: string
  description?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  gender?: string | null
  preferred_language?: string | null
  address?: string | null
  is_valid?: boolean | null
}

export type CustomerPublic = {
  company?: string
  description?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  gender?: string | null
  preferred_language?: string | null
  address?: string | null
  is_valid?: boolean | null
  id: string
}

export type CustomersPublic = {
  data: Array<CustomerPublic>
  count: number
}

export type CustomerUpdate = {
  company?: string
  description?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  gender?: string | null
  preferred_language?: string | null
  address?: string | null
  is_valid?: boolean | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type ItemCreate = {
  title: string
  description?: string | null
}

export type ItemPublic = {
  title: string
  description?: string | null
  id: string
  owner_id: string
}

export type ItemsPublic = {
  data: Array<ItemPublic>
  count: number
}

export type ItemUpdate = {
  title?: string | null
  description?: string | null
}

export type Message = {
  message: string
}

export type NewPassword = {
  token: string
  new_password: string
}

export type Order = {
  order_items?: string | null
  order_quantity?: string | null
  customer_id: string | null
  order_date?: string | null
  order_update_date?: string | null
  order_status?: string | null
  payment_status?: string | null
  notes?: string | null
  total_price?: number | null
  is_valid?: boolean | null
  id?: string
}

export type OrderCreate = {
  order_items?: string | null
  order_quantity?: string | null
  customer_id: string | null
  order_date?: string | null
  order_update_date?: string | null
  order_status?: string | null
  payment_status?: string | null
  notes?: string | null
  total_price?: number | null
  is_valid?: boolean | null
}

export type OrderPublic = {
  order_items?: string | null
  order_quantity?: string | null
  customer_id: string | null
  order_date?: string | null
  order_update_date?: string | null
  order_status?: string | null
  payment_status?: string | null
  notes?: string | null
  total_price?: number | null
  is_valid?: boolean | null
  id?: string
}

export type OrdersCount = {
  count: number
}

export type OrdersPublic = {
  data: Array<OrderPublic>
  count: number
}

export type OrderUpdate = {
  order_items?: string | null
  order_quantity?: string | null
  customer_id: string | null
  order_date?: string | null
  order_update_date?: string | null
  order_status?: string | null
  payment_status?: string | null
  notes?: string | null
  total_price?: number | null
  is_valid?: boolean | null
}

export type PrivateUserCreate = {
  email: string
  password: string
  full_name: string
  is_verified?: boolean
}

export type Product = {
  brand?: string | null
  type?: string | null
  unit_price?: number | null
  price_currency?: string | null
  unit_cost?: number | null
  cost_currency?: string | null
  width?: number | null
  length?: number | null
  thickness?: number | null
  is_valid?: boolean | null
  id?: string
}

export type ProductCreate = {
  brand?: string | null
  type?: string | null
  unit_price?: number | null
  price_currency?: string | null
  unit_cost?: number | null
  cost_currency?: string | null
  width?: number | null
  length?: number | null
  thickness?: number | null
  is_valid?: boolean | null
  id?: string
}

export type ProductPublic = {
  brand?: string | null
  type?: string | null
  unit_price?: number | null
  price_currency?: string | null
  unit_cost?: number | null
  cost_currency?: string | null
  width?: number | null
  length?: number | null
  thickness?: number | null
  is_valid?: boolean | null
  id?: string
}

export type ProductsPublic = {
  data: Array<ProductPublic>
  count: number
}

export type ProductUpdate = {
  brand?: string | null
  type?: string | null
  unit_price?: number | null
  price_currency?: string | null
  unit_cost?: number | null
  cost_currency?: string | null
  width?: number | null
  length?: number | null
  thickness?: number | null
  is_valid?: boolean | null
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserCreate = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password: string
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: string
}

export type UserRegister = {
  email: string
  password: string
  full_name?: string | null
}

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type UserUpdate = {
  email?: string | null
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password?: string | null
}

export type UserUpdateMe = {
  full_name?: string | null
  email?: string | null
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type AuthGoogleLoginResponse = unknown

export type AuthGoogleCallbackResponse = unknown

export type AuthHealthCheckResponse = boolean

export type CustomersReadCustomerCountData = {
  displayInvalid?: boolean
}

export type CustomersReadCustomerCountResponse = CustomerCount

export type CustomersGetProfileImageData = {
  customerId: string
}

export type CustomersGetProfileImageResponse = unknown

export type CustomersUploadProfileImageData = {
  customerId: string
  formData: Body_customers_upload_profile_image
}

export type CustomersUploadProfileImageResponse = unknown

export type CustomersReadCustomerData = {
  id: string
}

export type CustomersReadCustomerResponse = Customer

export type CustomersUpdateCustomerData = {
  id: string
  requestBody: CustomerUpdate
}

export type CustomersUpdateCustomerResponse = CustomerPublic

export type CustomersDeleteCustomerData = {
  id: string
}

export type CustomersDeleteCustomerResponse = Message

export type CustomersReadCustomersData = {
  displayInvalid?: boolean
  limit?: number
  skip?: number
}

export type CustomersReadCustomersResponse = CustomersPublic

export type CustomersCreateCustomerData = {
  requestBody: CustomerCreate
}

export type CustomersCreateCustomerResponse = Customer

export type ItemsReadItemsData = {
  limit?: number
  skip?: number
}

export type ItemsReadItemsResponse = ItemsPublic

export type ItemsCreateItemData = {
  requestBody: ItemCreate
}

export type ItemsCreateItemResponse = ItemPublic

export type ItemsReadItemData = {
  id: string
}

export type ItemsReadItemResponse = ItemPublic

export type ItemsUpdateItemData = {
  id: string
  requestBody: ItemUpdate
}

export type ItemsUpdateItemResponse = ItemPublic

export type ItemsDeleteItemData = {
  id: string
}

export type ItemsDeleteItemResponse = Message

export type LoginLoginAccessTokenData = {
  formData: Body_login_login_access_token
}

export type LoginLoginAccessTokenResponse = Token

export type LoginTestTokenResponse = UserPublic

export type LoginRecoverPasswordData = {
  email: string
}

export type LoginRecoverPasswordResponse = Message

export type LoginResetPasswordData = {
  requestBody: NewPassword
}

export type LoginResetPasswordResponse = Message

export type LoginRecoverPasswordHtmlContentData = {
  email: string
}

export type LoginRecoverPasswordHtmlContentResponse = string

export type OrdersGetOrderInvoiceData = {
  orderId: string
}

export type OrdersGetOrderInvoiceResponse = unknown

export type OrdersReadCustomerOrdersCountData = {
  customerId?: string
  displayInvalid?: boolean
  endDate?: string
  orderStatus?: string
  startDate?: string
}

export type OrdersReadCustomerOrdersCountResponse = OrdersCount

export type OrdersReadOrderData = {
  id: string
}

export type OrdersReadOrderResponse = Order

export type OrdersUpdateOrderData = {
  id: string
  requestBody: OrderUpdate
}

export type OrdersUpdateOrderResponse = OrderPublic

export type OrdersDeleteOrderData = {
  id: string
}

export type OrdersDeleteOrderResponse = Message

export type OrdersReadOrdersData = {
  customerId?: string
  displayInvalid?: boolean
  endDate?: string
  limit?: number
  orderStatus?: string
  skip?: number
  sortOrder?: string
  startDate?: string
}

export type OrdersReadOrdersResponse = OrdersPublic

export type OrdersCreateOrderData = {
  requestBody: OrderCreate
}

export type OrdersCreateOrderResponse = Order

export type PrivateCreateUserData = {
  requestBody: PrivateUserCreate
}

export type PrivateCreateUserResponse = UserPublic

export type ProductsReadProductData = {
  id: string
}

export type ProductsReadProductResponse = Product

export type ProductsUpdateProductData = {
  id: string
  requestBody: ProductUpdate
}

export type ProductsUpdateProductResponse = ProductPublic

export type ProductsDeleteProductData = {
  id: string
}

export type ProductsDeleteProductResponse = Message

export type ProductsReadProductsData = {
  brand?: string
  displayInvalid?: boolean
  limit?: number
  skip?: number
  type?: string
}

export type ProductsReadProductsResponse = ProductsPublic

export type ProductsCreateProductData = {
  requestBody: ProductCreate
}

export type ProductsCreateProductResponse = Product

export type UsersReadUsersData = {
  limit?: number
  skip?: number
}

export type UsersReadUsersResponse = UsersPublic

export type UsersCreateUserData = {
  requestBody: UserCreate
}

export type UsersCreateUserResponse = UserPublic

export type UsersReadUserMeResponse = UserPublic

export type UsersDeleteUserMeResponse = Message

export type UsersUpdateUserMeData = {
  requestBody: UserUpdateMe
}

export type UsersUpdateUserMeResponse = UserPublic

export type UsersUpdatePasswordMeData = {
  requestBody: UpdatePassword
}

export type UsersUpdatePasswordMeResponse = Message

export type UsersRegisterUserData = {
  requestBody: UserRegister
}

export type UsersRegisterUserResponse = UserPublic

export type UsersReadUserByIdData = {
  userId: string
}

export type UsersReadUserByIdResponse = UserPublic

export type UsersUpdateUserData = {
  requestBody: UserUpdate
  userId: string
}

export type UsersUpdateUserResponse = UserPublic

export type UsersDeleteUserData = {
  userId: string
}

export type UsersDeleteUserResponse = Message

export type UtilsTestEmailData = {
  emailTo: string
}

export type UtilsTestEmailResponse = Message

export type UtilsHealthCheckResponse = boolean
