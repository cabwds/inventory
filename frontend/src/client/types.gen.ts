// This file is auto-generated by @hey-api/openapi-ts

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
  order_ids?: string | null
  id?: string
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
  order_ids?: string | null
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
  order_ids?: string | null
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
  order_ids?: string | null
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
  displayInvalid?: boolean
  limit?: number
  skip?: number
}

export type OrdersReadOrdersResponse = OrdersPublic

export type OrdersCreateOrderData = {
  requestBody: OrderCreate
}

export type OrdersCreateOrderResponse = Order

export type OrdersReadCustomerOrdersData = {
  customerId: string
  displayInvalid?: boolean
  limit?: number
  skip?: number
}

export type OrdersReadCustomerOrdersResponse = OrdersPublic

export type PrivateCreateUserData = {
  requestBody: PrivateUserCreate
}

export type PrivateCreateUserResponse = UserPublic

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
