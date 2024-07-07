import { TaskEither } from "fp-ts/lib/TaskEither"

type decimal = never
export type int = number

type NonEmptyList<T> = {
  First: T
  Rest: T[]
}

type WidgetCode = string
type GizmoCode = never
export type ProductCode = WidgetCode | GizmoCode

export type UnitQuantity = {
  readonly type: "UnitQuantity"
  readonly value: int
}

type KilogramQuatity = decimal
type OrderQuantity = UnitQuantity | KilogramQuatity


type OrderId = never
type OrderLineId = never
type CustomerId = int

type CustomerInfo = never
type ShippingAddress = never
type BillingAddress = never
export type Price = never
type BillingAmount = never
type ValidatedOrderLine = never

type Order = UnvalidateOrder | ValidatedOrder | PricedOrder

type OrderLine = {
  Id: OrderLineId
  OrderId: OrderId
  ProductCode: ProductCode
  OrderQuantity: OrderQuantity
}

export type UnvalidateOrder = {
  OrderId: string
  CustomerInfo: never
  ShippingAddress: never
}

export type ValidatedOrder = {
  OrderId: OrderId
  CustomerId: CustomerId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  OrderLines: ValidatedOrderLine[]
}

type Address = never
type PricedOrderLine = never

export type PricedOrder = {
  OrderId: OrderId
  CustomerId: CustomerId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  OrderLines: PricedOrderLine[]
  AmountToBill: BillingAmount
  Price: Price
}

type AcknowledgmentSent = never
type OrderPlaced = never
type BillableOrderPlaced = {
  OrderId: OrderId
  BillingAddress: BillingAddress
  AmountToBill: BillingAmount
}

export type PlaceOrderEvents =
  AcknowledgmentSent | OrderPlaced | BillableOrderPlaced

export type ValidationError = {
  FieldName: string
  ErrorDescription: string
}

export type PlaceOrderError = ValidationError[]

export type ValidationResponse<T> = TaskEither<ValidationError, T>

type EmailAddress = never
type VerifiedEmailAddress = never

type CustomerEmail = {
  Unverified: EmailAddress,
  Verified: VerifiedEmailAddress
}

export type UnvalidatedAddress = never
export type CheckedAddress = UnvalidatedAddress
export type AddressValidationError = string

export type HtmlString = string
export type OrderAcknowledgment = {
  EmailAddress: EmailAddress
  Letter: HtmlString
}

type Sent = never
type NotSent = never
export type SendResult = Sent | NotSent

export type OrderAcknowledgmentSent = {
  OrderId: OrderId
  EmailAddress: EmailAddress
}

type OrderPriced = PricedOrder
export type PricingError = string
