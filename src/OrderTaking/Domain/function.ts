import { Option } from "fp-ts/lib/Option";
import { Task } from "fp-ts/lib/Task";
import { PricedOrder } from "../../PlaceOrderWorkflow";
import { HtmlString, OrderAcknowledgment, SendResult } from "./type";
import { OrderAcknowledgmentSent, PlaceOrderEvents } from "../../DomainApi";

type CreateOrderAcknowledgmentLetter =
  (arg: PricedOrder) =>
    HtmlString

type SendOrderAcknowledgment =
  (arg: OrderAcknowledgment) =>
    Task<SendResult>

type AcknowledgeOrder =
  (func: CreateOrderAcknowledgmentLetter) =>
    (func: SendOrderAcknowledgment) =>
      (arg: PricedOrder) =>
        Task<Option<OrderAcknowledgmentSent>>

type CreateEvents =
  (arg: PricedOrder) =>
    PlaceOrderEvents[]
