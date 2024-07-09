import { Either } from "fp-ts/lib/Either"
import { Address } from "./Common.CompoundTypes"
import { BillingAmount, decimal, EmailAddress, OrderId } from "./Common.SimpleTypes"
import { PricedOrder } from "./PlaceOrder.Implemantation"
import { TaskEither } from "fp-ts/lib/TaskEither"

export type UnvalidatedCustomerInfo = {
  FirstName: string
  LastName: string
  EmailAddless: string
}

export type UnvalidatedAddress = {
  AddressLine1: string
  AddressLine2: string
  AddressLine3: string
  AddressLine4: string
  City: string
  ZipCode: string
}

export type UnvalidatedOrderLine = {
  OrderLineId: string
  ProductCode: string
  Quantity: decimal
}

export type UnvalidatedOrder = {
  OrderId: string
  CustomerInfo: UnvalidatedCustomerInfo
  ShippingAddress: UnvalidatedAddress
  BillingAddress: UnvalidatedAddress
  Lines: UnvalidatedOrderLine[]
}

export type OrderAcknowledgmentSent = {
  OrderId: OrderId
  EmailAddress: EmailAddress
}

export type OrderPlaced = PricedOrder

export type BillableOrderPlaced = {
  OrderId: OrderId
  BillingAddress: Address
  AmountToBill: BillingAmount
}

export type PlaceOrderEvent =
  OrderAcknowledgmentSent
  | BillableOrderPlaced
  | OrderPlaced

export type ValidationError = {
  type: "ValidationError"
  value: string
}

export type PricingError = {
  type: "PricingError"
}

type ServiceInfo = {
  Name: string
  Endpoint: Uri
}

type RemoteServiceError = {
  Service: ServiceInfo
  Exception: Exception
}

export type PlaceOrderError =
  ValidationError
  | PricingError

export type PlaceOrderWorkflow =
  (unvalidatedOrder: UnvalidatedOrder) =>
    TaskEither<PlaceOrderError, PlaceOrderEvent[]>
