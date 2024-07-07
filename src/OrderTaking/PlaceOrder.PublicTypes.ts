import { decimal } from "./Common.SimpleTypes"

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
