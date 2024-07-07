import { TaskEither } from "fp-ts/lib/TaskEither"
import { BillingAddress, BillingAmount } from "./OrderTaking/Domain/type"
import { OrderId } from "./OrderTaking/Domain/OrderId"
import { EmailAddress } from "./OrderTaking/Common.SimpleTypes"
import { UnvalidatedAddress, UnvalidatedCustomerInfo, UnvalidatedOrder } from "./OrderTaking/PlaceOrder.PublicTypes"
import { PricedOrder, ValidationError } from "./OrderTaking/PlaceOrder.Implemantation"

// input data

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

