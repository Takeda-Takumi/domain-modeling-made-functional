import { TaskEither } from "fp-ts/lib/TaskEither"

type decimal = never
export type int = number

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

type Order = {
  Id: OrderId
  CustomerId: CustomerId
  CustomerInfo: CustomerInfo
  ShippingAddress: ShippingAddress
  BillingAddress: BillingAddress
  OrderLines: OrderLine[]
  AmountToBill: BillingAmount
  Price: Price
}

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
