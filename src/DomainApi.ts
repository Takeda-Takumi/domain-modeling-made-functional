import { TaskEither } from "fp-ts/lib/TaskEither"
import { BillingAddress } from "./OrderTaking/Domain/type"
import { OrderId } from "./OrderTaking/Domain/OrderId"
import { BillingAmount, EmailAddress } from "./OrderTaking/Common.SimpleTypes"
import { PlaceOrderEvent, UnvalidatedOrder } from "./OrderTaking/PlaceOrder.PublicTypes"
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



type PlaceOrderError = ValidationError[]

type PlaceOrderWorkflow =
  (arg: PlaceOrderCommand) =>
    TaskEither<PlaceOrderError, PlaceOrderEvent[]>

