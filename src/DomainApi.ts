import { TaskEither } from "fp-ts/lib/TaskEither"
import { BillingAddress, BillingAmount, EmailAddress } from "./OrderTaking/Domain/type"
import { OrderId, PricedOrder, ValidationError } from "./PlaceOrderWorkflow"

// input data
export type UnvalidatedOrder = {
  OrderId: string
  CustomerInfo: UnvalidatedCustomer
  ShippingAddress: UnvalidatedAddress
}

type UnvalidatedCustomer = {
  Name: string
  Email: string
}

export type UnvalidatedAddress = never

// input command
type Command<Data> = {
  Data: Data
  Timestamp: Date
  UserId: string
  // etc
}

type PlaceOrderCommand = Command<UnvalidatedOrder>

// public api

type OrderPlaced = PricedOrder
type BillableOrderPlaced = {
  OrderId: OrderId
  BillingAddress: BillingAddress
  AmountToBill: BillingAmount
}

export type OrderAcknowledgmentSent = {
  OrderId: OrderId
  EmailAddress: EmailAddress
}

export type PlaceOrderEvents =
  OrderAcknowledgmentSent | BillableOrderPlaced | OrderPlaced

type PlaceOrderError = ValidationError[]

type PlaceOrderWorkflow =
  (arg: PlaceOrderCommand) =>
    TaskEither<PlaceOrderError, PlaceOrderEvents[]>

