import { Either } from "fp-ts/lib/Either";
import { AddressValidationError, CheckedAddress, HtmlString, OrderAcknowledgment, OrderAcknowledgmentSent, PlaceOrderError, PlaceOrderEvents, Price, PricedOrder, PricingError, ProductCode, SendResult, UnvalidatedAddress, UnvalidateOrder, ValidatedOrder, ValidationError, ValidationResponse } from "./type";
import { Option } from "fp-ts/lib/Option";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Task } from "fp-ts/lib/Task";

type ValidateOrder =
  (func: CheckProductCodeExist) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidateOrder) =>
        TaskEither<ValidationError, ValidatedOrder>

type PriceOrder =
  (func: GetProductPrice) =>
    (arg: ValidatedOrder) =>
      Either<PricingError, PricedOrder>

type CheckProductCodeExist = (arg: ProductCode) => boolean

type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    TaskEither<AddressValidationError, CheckedAddress>

type GetProductPrice =
  (arg: ProductCode) =>
    Price

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
