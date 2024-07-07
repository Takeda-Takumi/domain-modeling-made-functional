import { OrderId } from "../../PlaceOrderWorkflow"

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


type OrderLineId = never
export type CustomerId = int

export type ShippingAddress = never
export type BillingAddress = never
export type Price = never
export type BillingAmount = never


type OrderLine = {
  Id: OrderLineId
  OrderId: OrderId
  ProductCode: ProductCode
  OrderQuantity: OrderQuantity
}

type AcknowledgmentSent = never
type OrderPlaced = never

export type EmailAddress = never
type VerifiedEmailAddress = never

type CustomerEmail = {
  Unverified: EmailAddress,
  Verified: VerifiedEmailAddress
}


export type HtmlString = string
export type OrderAcknowledgment = {
  EmailAddress: EmailAddress
  Letter: HtmlString
}

type Sent = never
type NotSent = never
export type SendResult = Sent | NotSent



