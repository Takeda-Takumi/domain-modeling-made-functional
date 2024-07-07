import { Either } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import { createOrderId, OrderId } from "./Domain/OrderId"
import { Address, CustomerInfo } from "./Common.CompoundTypes"
import { toAddress, toCunstomerInfo } from "./PlaceOrder.Dto"
import { match } from "./Domain/type"
import { UnvalidatedAddress, UnvalidatedOrder, UnvalidatedOrderLine } from "./PlaceOrder.PublicTypes"
import { BillingAmount, createInt, createKilogramQuantity, createOrderLineId, createOrderQuantity, createProductCode, createUnitQuantity, decimal, GizmoCode, OrderLineId, OrderQuantity, Price, ProductCode, sumPricesBillingAmount, WidgetCode } from "./Common.SimpleTypes"
import { array } from "fp-ts"

// 注文のライフサクル

// 検証済みの状態
type ValidatedOrderLine = {
  OrderLineId: OrderLineId,
  ProductCode: ProductCode,
  Quantity: OrderQuantity
}
type ValidatedOrder = {
  OrderId: OrderId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  Lines: ValidatedOrderLine[]
}


// 価格計算済みの状態
type PricedOrderLine = {
  OrderLineId: OrderLineId
  ProductCode: ProductCode
  Quantity: OrderQuantity
  LinePrice: Price
}

// 全状態の結合
export type PricedOrder = {
  OrderId: OrderId
  CustomerInfo: CustomerInfo
  ShippingAddress: Address
  BillingAddress: Address
  AmountToBill: BillingAmount
  Lines: PricedOrderLine[]
}

type Order = UnvalidatedOrder | ValidatedOrder | PricedOrder

// 内部ステップの定義

// 注文の検証

type CheckProductCodeExist =
  (arg: ProductCode) =>
    boolean

type AddressValidationError = string
type CheckedAddress = UnvalidatedAddress

export type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    CheckedAddress

type ValidateOrder =
  (func: CheckProductCodeExist) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidatedOrder) =>
        ValidatedOrder
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
      PricedOrder


const validateOrder: ValidateOrder =
  (checkProductCodeExist: CheckProductCodeExist) =>
    (checkAddressExists: CheckAddressExists) =>
      (unvalidatedOrder: UnvalidatedOrder) => {
        const orderId = pipe(
          unvalidatedOrder.OrderId,
          createOrderId
        )
        const customerInfo = pipe(
          unvalidatedOrder.CustomerInfo,
          toCunstomerInfo
        )
        const shippingAddress = pipe(
          unvalidatedOrder.ShippingAddress,
          toAddress(checkAddressExists)
        )
        const orderLines = pipe(
          unvalidatedOrder.Lines,
          array.map(toValidatedOrderLine(checkProductCodeExist))
        )
        return {} as ValidatedOrder
      }

const toValidatedOrderLine =
  (checkProductCodeExist: CheckProductCodeExist) =>
    (unvalidatedOrderLine: UnvalidatedOrderLine) => {
      const orderLineId = pipe(
        unvalidatedOrderLine.OrderLineId,
        createOrderLineId
      )
      const productCode = pipe(
        unvalidatedOrderLine.ProductCode,
        toProductCode(checkProductCodeExist)
      )

      const quantity = pipe(
        unvalidatedOrderLine.Quantity,
        toOrderQuantity(productCode)
      )

      const validatedOrderLine: ValidatedOrderLine = {
        OrderLineId: orderLineId,
        ProductCode: productCode,
        Quantity: quantity
      }

      return validatedOrderLine
    }

const predicateToPassthru =
  <T>(errorMsg: string) =>
    (f: (arg: T) => boolean) =>
      (x: T) => {
        if (f(x)) {
          return x
        } else {
          throw new Error(errorMsg)
        }
      }
const toProductCode =
  (checkProductCodeExist: CheckProductCodeExist) =>
    (productCode: string) => {
      const checkProduct =
        (productCode: ProductCode) => {
          const errorMsg = "Invalid"
          return predicateToPassthru<ProductCode>(errorMsg)(checkProductCodeExist)(productCode)
        }

      return pipe(
        productCode,
        createProductCode,
        checkProduct,
      )
    }
const toOrderQuantity =
  (productCode: ProductCode) =>
    (quantity: decimal): OrderQuantity => {
      match(productCode)<OrderQuantity>({
        WidgetCode: (widgetCode: WidgetCode) => {
          return pipe(
            quantity,
            createInt,
            createUnitQuantity
          )
        },
        GizmoCode: (gizmoCode: GizmoCode) => {
          return pipe(
            quantity,
            createKilogramQuantity
          )

        }
      })

      return createOrderQuantity(productCode)(quantity)
    }
const toPricedOrderLine =
  (getProductPrice: GetProductPrice) =>
    (line: ValidatedOrderLine): PricedOrderLine => {
      throw new Error()
      return {} as PricedOrderLine
    }

const priceOrder: PriceOrder =
  (getProductPrice: GetProductPrice) =>
    (validateOrder: ValidatedOrder) => {
      const lines = pipe(
        validateOrder.Lines,
        array.map(toPricedOrderLine(getProductPrice))
      )
      const amountToBill = pipe(
        lines,
        array.map((line) => line.LinePrice),
        sumPricesBillingAmount
      )
      const pricedOrder: PricedOrder = {
        OrderId: validateOrder.OrderId,
        CustomerInfo: validateOrder.CustomerInfo,
        ShippingAddress: validateOrder.ShippingAddress,
        BillingAddress: validateOrder.BillingAddress,
        Lines: lines,
        AmountToBill: amountToBill
      }
      return pricedOrder
    }
