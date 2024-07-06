import { string } from "fp-ts"
import { TaskEither } from "fp-ts/lib/TaskEither"

type decimal = never
type int = never

type CustomerId = int
type WidgetCode = string
type UnitQuantity = int
type KilogramQuatity = decimal

type CustomerInfo = never
type ShippingAddress = never
type BillingAddress = never
type OrderLine = never
type BillingAmount = never

type Order = {
  CustomerInfo: CustomerInfo
  ShippingAddress: ShippingAddress
  BillingAddress: BillingAddress
  OrderLines: OrderLine[]
  AmountToBill: BillingAmount
}

type Gizmo = never

type ProductCode = WidgetCode | Gizmo
type OrderQuantity = UnitQuantity | KilogramQuatity

export type UnvalidateOrder = never
export type ValidateOrder = never

type AcknowledgmentSent = never
type OrderPlaced = never
type BillableOrderPlaced = never

export type PlaceOrderEvents = {
  AcknowledgmentSent: AcknowledgmentSent
  OrderPlaced: OrderPlaced
  BillableOrderPlaced: BillableOrderPlaced
}

type QuoteForm = never
type OrderForm = never
export type EnvelopeContents = string
export type CategorizedMail = QuoteForm | OrderForm

export type ValidationError = {
  FieldName: string
  ErrorDescription: string
}

export type ValidationResponse<T> = TaskEither<ValidationError, T>
