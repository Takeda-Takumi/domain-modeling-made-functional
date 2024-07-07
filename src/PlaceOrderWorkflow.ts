import { TaskEither } from "fp-ts/lib/TaskEither"
import { UnvalidatedAddress, UnvalidatedOrder } from "./DomainApi"
import { BillingAmount, CustomerId, Price, ProductCode } from "./OrderTaking/Domain/type"
import { Either } from "fp-ts/lib/Either"

// 注文のライフサクル

// 検証済みの状態
type ValidatedOrderLine = never
type ValidatedOrder = {
  OrderId: OrderId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  OrderLines: ValidatedOrderLine[]
}

export type OrderId = never
export type CustomerInfo = never
type Address = never

// 価格計算済みの状態
type PricedOrderLine = never

// 全状態の結合
export type PricedOrder = {
  OrderId: OrderId
  CustomerId: CustomerId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  OrderLines: PricedOrderLine[]
  AmountToBill: BillingAmount
  Price: Price
}

type Order = UnvalidatedOrder | ValidatedOrder | PricedOrder

// 内部ステップの定義

// 注文の検証

type CheckProductCodeExist =
  (arg: ProductCode) =>
    boolean

type AddressValidationError = string
type CheckedAddress = UnvalidatedAddress

type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    TaskEither<AddressValidationError, CheckedAddress>

type ValidateOrder =
  (func: CheckProductCodeExist) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidatedOrder) =>
        TaskEither<ValidationError, ValidatedOrder>
export type ValidationError = {
  FieldName: string
  ErrorDescription: string
}


type GetProductPrice =
  (arg: ProductCode) =>
    Price

export type PricingError = string
type PriceOrder =
  (func: GetProductPrice) =>
    (arg: ValidatedOrder) =>
      Either<PricingError, PricedOrder>


