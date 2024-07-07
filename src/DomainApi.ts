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

export type PlaceOrderWorkflow =
  (unvalidatedOrder: UnvalidatedOrder) =>
    PlaceOrderEvent[]

