import { flow, identity, pipe } from "fp-ts/lib/function"
import { Address, CustomerInfo } from "./Common.CompoundTypes"
import { toAddress, toCunstomerInfo } from "./PlaceOrder.Dto"
import { BillableOrderPlaced, OrderAcknowledgmentSent, OrderPlaced, PlaceOrderEvent, PlaceOrderWorkflow, UnvalidatedAddress, UnvalidatedOrder, UnvalidatedOrderLine } from "./PlaceOrder.PublicTypes"
import { BillingAmount, createInt, createKilogramQuantity, createOrderId, createOrderLineId, createOrderQuantity, createProductCode, createUnitQuantity, decimal, EmailAddress, GizmoCode, OrderId, OrderLineId, OrderQuantity, Price, ProductCode, sumPricesBillingAmount, WidgetCode } from "./Common.SimpleTypes"
import { array, either, option, taskEither } from "fp-ts"
import { Option } from "fp-ts/lib/Option"
import { match } from "./util"
import { Either } from "fp-ts/lib/Either"

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

type CheckProductCodeExists =
  (arg: ProductCode) =>
    boolean

type AddressValidationError = string
type CheckedAddress = UnvalidatedAddress

export type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    CheckedAddress

type ValidateOrder =
  (func: CheckProductCodeExists) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidatedOrder) =>
        Either<ValidationError, ValidatedOrder>

export type ValidationError = {
  FieldName: string
  ErrorDescription: string
}


type GetProductPrice =
  (arg: ProductCode) =>
    Price

export type PricingError = {
  type: "PricingError"
}
type PriceOrder =
  (func: GetProductPrice) =>
    (arg: ValidatedOrder) =>
      Either<PricingError, PricedOrder>


const validateOrder: ValidateOrder =
  (checkProductCodeExists: CheckProductCodeExists) =>
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
          array.map(toValidatedOrderLine(checkProductCodeExists))
        )
        throw new Error()
        return {} as Either<ValidationError, ValidatedOrder>
      }

const toValidatedOrderLine =
  (checkProductCodeExists: CheckProductCodeExists) =>
    (unvalidatedOrderLine: UnvalidatedOrderLine) => {
      const orderLineId = pipe(
        unvalidatedOrderLine.OrderLineId,
        createOrderLineId
      )
      const productCode = pipe(
        unvalidatedOrderLine.ProductCode,
        toProductCode(checkProductCodeExists)
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
  (checkProductCodeExists: CheckProductCodeExists) =>
    (productCode: string) => {
      const checkProduct =
        (productCode: ProductCode) => {
          const errorMsg = "Invalid"
          return predicateToPassthru<ProductCode>(errorMsg)(checkProductCodeExists)(productCode)
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
      return either.right(pricedOrder)
    }

export type HtmlString = string

type CreateOrderAcknowledgmentLetter =
  (arg: PricedOrder) =>
    HtmlString

export type OrderAcknowledgment = {
  EmailAddress: EmailAddress
  Letter: HtmlString
}

type Sent = {
  type: "Sent"
}
type NotSent = {
  type: "NotSent"
}
export type SendResult = Sent | NotSent

type SendOrderAcknowledgment =
  (arg: OrderAcknowledgment) =>
    SendResult

type AcknowledgeOrder =
  (func: CreateOrderAcknowledgmentLetter) =>
    (func: SendOrderAcknowledgment) =>
      (arg: PricedOrder) =>
        Option<OrderAcknowledgmentSent>

const acknowledgeOrder: AcknowledgeOrder =
  (createOrderAcknowledgmentLetter: CreateOrderAcknowledgmentLetter) =>
    (sendOrderAcknowledgment: SendOrderAcknowledgment) =>
      (pricedOrder: PricedOrder) => {
        const letter = createOrderAcknowledgmentLetter(pricedOrder)
        const acknowledgment: OrderAcknowledgment = {
          EmailAddress: pricedOrder.CustomerInfo.EmailAddress,
          Letter: letter
        }
        return match(sendOrderAcknowledgment(acknowledgment))({
          Sent: () => {
            const event: OrderAcknowledgmentSent = {
              OrderId: pricedOrder.OrderId,
              EmailAddress: pricedOrder.CustomerInfo.EmailAddress
            }
            return option.some(event)
          },
          NotSent: () => option.none
        })
      }

type CreateEvents =
  (arg: PricedOrder) =>
    (arg: Option<OrderAcknowledgmentSent>) =>
      PlaceOrderEvent[]

const createOrderPlacedEvent =
  (placedOrder: PricedOrder): OrderPlaced =>
    placedOrder


const createBillingEvent =
  (placedOrder: PricedOrder): Option<BillableOrderPlaced> => {
    const billingAmount = pipe(
      placedOrder.AmountToBill.value
    )
    if (billingAmount > 0) {
      return option.some({
        OrderId: placedOrder.OrderId,
        BillingAddress: placedOrder.BillingAddress,
        AmountToBill: placedOrder.AmountToBill
      })
    } else return option.none
  }

const createEvents: CreateEvents =
  (pricedOrder: PricedOrder) =>
    (acknowledgementEventOpt: Option<OrderAcknowledgmentSent>) => {
      const acknowledgmentEvents = pipe(
        acknowledgementEventOpt,
        array.fromOption
      )
      const orderPlacedEvents = pipe(
        pricedOrder,
        createOrderPlacedEvent,
        array.of
      )
      const billingEvents = pipe(
        pricedOrder,
        createBillingEvent,
        array.fromOption
      )
      return [
        acknowledgmentEvents,
        orderPlacedEvents,
        billingEvents,
      ].flatMap(identity<Array<PlaceOrderEvent>>)


    }

const placeOrder =
  (checkProductCodeExists: CheckProductCodeExists) =>
    (checkAddressExists: CheckAddressExists) =>
      (getProductPrice: GetProductPrice) =>
        (createOrderAcknowledgmentLetter: CreateOrderAcknowledgmentLetter) =>
          (sendOrderAcknowledgment: SendOrderAcknowledgment): PlaceOrderWorkflow =>
            (unvalidatedOrder: UnvalidatedOrder) => {
              const validatedOrderAdapted = pipe(
                unvalidatedOrder,
                validateOrder
                  (checkProductCodeExists)
                  (checkAddressExists),
              )
              const pricedOrderAdapted = pipe(
                validatedOrderAdapted,
                either.flatMap(priceOrder(getProductPrice))
              )
              const acknowledgmentOption = pipe(
                pricedOrderAdapted,
                either.map(
                  acknowledgeOrder
                    (createOrderAcknowledgmentLetter)
                    (sendOrderAcknowledgment)
                )
              )
              const events = either.ap(acknowledgmentOption)(either.map(createEvents)(pricedOrderAdapted))
              return events
            }
