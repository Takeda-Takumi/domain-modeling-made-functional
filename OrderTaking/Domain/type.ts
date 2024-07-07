import { TaskEither } from "fp-ts/lib/TaskEither"

type decimal = never
export type int = number

type NonEmptyList<T> = {
  First: T
  Rest: T[]
}

type WidgetCode = string
type GizmoCode = never
type ProductCode = WidgetCode | GizmoCode

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
type Price = never
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

type ValidatedOrder = {
  OrderId: OrderId
  CustomerId: CustomerId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  OrderLines: ValidatedOrderLine[]
}

type Address = never
type PricedOrderLine = never

type PricedOrder = {
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
type BillableOrderPlaced = never

export type PlaceOrderEvents = {
  AcknowledgmentSent: AcknowledgmentSent
  OrderPlaced: OrderPlaced
  BillableOrderPlaced: BillableOrderPlaced
}

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

