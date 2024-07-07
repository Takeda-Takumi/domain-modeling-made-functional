import { Either } from "fp-ts/lib/Either";
import { AddressValidationError, CheckedAddress, HtmlString, OrderAcknowledgment, OrderAcknowledgmentSent, PlaceOrderError, PlaceOrderEvents, Price, PricedOrder, ProductCode, SendResult, UnvalidatedAddress, UnvalidateOrder, ValidatedOrder, ValidationError, ValidationResponse } from "./type";
import { Option } from "fp-ts/lib/Option";

type ValidateOrder =
  (func: CheckProductCodeExist) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidateOrder) =>
        Either<ValidationError, ValidatedOrder>

type PlaceOrder =
  (func: GetProductPrice) =>
    (arg: UnvalidateOrder) =>
      Either<PlaceOrderError, PlaceOrderEvents>

type CheckProductCodeExist = (arg: ProductCode) => boolean

type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    Either<AddressValidationError, CheckedAddress>

type GetProductPrice =
  (arg: ProductCode) =>
    Price

type CreateOrderAcknowledgmentLetter =
  (arg: PricedOrder) =>
    HtmlString

type SendOrderAcknowledgment =
  (arg: OrderAcknowledgment) =>
    SendResult

type AcknowledgeOrder =
  (func: CreateOrderAcknowledgmentLetter) =>
    (func: SendOrderAcknowledgment) =>
      (arg: PricedOrder) =>
        Option<OrderAcknowledgmentSent>

type CreateEvents =
  (arg: PricedOrder) =>
    PlaceOrderEvents[]
