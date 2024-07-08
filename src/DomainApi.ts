import { PlaceOrderError, PlaceOrderEvent, UnvalidatedOrder } from "./OrderTaking/PlaceOrder.PublicTypes"
import { PricedOrder, ValidationError } from "./OrderTaking/PlaceOrder.Implemantation"
import { Either } from "fp-ts/lib/Either"

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



export type PlaceOrderWorkflow =
  (unvalidatedOrder: UnvalidatedOrder) =>
    Either<PlaceOrderError, PlaceOrderEvent[]>

