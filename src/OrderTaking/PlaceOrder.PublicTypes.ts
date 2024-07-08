import { Address } from "./Common.CompoundTypes"
import { BillingAmount, decimal, EmailAddress, OrderId } from "./Common.SimpleTypes"
import { PricedOrder, PricingError, ValidationError } from "./PlaceOrder.Implemantation"

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

export type PlaceOrderError =
  ValidationError
  | PricingError
