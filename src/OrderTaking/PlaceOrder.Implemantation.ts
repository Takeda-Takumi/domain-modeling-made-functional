import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import { Address, CustomerInfo, PersonalName } from "./Common.CompoundTypes"
import { BillableOrderPlaced, OrderAcknowledgmentSent, OrderPlaced, PlaceOrderEvent, PlaceOrderWorkflow, PricingError, UnvalidatedAddress, UnvalidatedCustomerInfo, UnvalidatedOrder, UnvalidatedOrderLine, ValidationError } from "./PlaceOrder.PublicTypes"
import { BillingAmount, createEmailAddress, createInt, createKilogramQuantity, createOptionString50, createOrderId, createOrderLineId, createOrderQuantity, createProductCode, createString50, createUnitQuantity, createZipCode, decimal, EmailAddress, GizmoCode, OrderId, OrderLineId, OrderQuantity, Price, ProductCode, sumPricesBillingAmount, WidgetCode } from "./Common.SimpleTypes"
import { array, either, option, taskEither } from "fp-ts"
import { Option } from "fp-ts/lib/Option"
import { match } from "./util"
import { Either, right } from "fp-ts/lib/Either"
import { TaskEither } from "fp-ts/lib/TaskEither"

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

type InvalidFormat = {
  type: "InvalidFormat"
}
type AddressNotFound = {
  type: "AddressNotFound"
}
type AddressValidationError =
  InvalidFormat
  | AddressNotFound

type CheckedAddress = UnvalidatedAddress

export type CheckAddressExists =
  (arg: UnvalidatedAddress) =>
    TaskEither<AddressValidationError, CheckedAddress>

type ValidateOrder =
  (func: CheckProductCodeExists) =>
    (func: CheckAddressExists) =>
      (arg: UnvalidatedOrder) =>
        TaskEither<ValidationError, ValidatedOrder>



type GetProductPrice =
  (arg: ProductCode) =>
    Price

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
          toOrderId,
          taskEither.fromEither
        )
        const customerInfo = pipe(
          unvalidatedOrder.CustomerInfo,
          toCustomerInfo,
          taskEither.fromEither
        )
        const checkedShippingAddress = pipe(
          unvalidatedOrder.ShippingAddress,
          toCheckedAddress(checkAddressExists)
        )
        const shippingAddress = pipe(
          checkedShippingAddress,
          taskEither.flatMap(
            (unvalidatedAddress: UnvalidatedAddress) =>
              pipe(
                unvalidatedAddress,
                toAddress,
                taskEither.fromEither
              )
          )
        )
        const checkedBillingAddress = pipe(
          unvalidatedOrder.BillingAddress,
          toCheckedAddress(checkAddressExists)
        )
        const billingAddress = pipe(
          checkedBillingAddress,
          taskEither.flatMap(flow(toAddress, taskEither.fromEither))
        )
        const lines = pipe(
          unvalidatedOrder.Lines,
          array.map(toValidatedOrderLine(checkProductCodeExists)),
          array.sequence(either.Applicative),
          taskEither.fromEither
        )

        return pipe(
          orderId,
          taskEither.flatMap((orderId: OrderId) =>
            pipe(
              customerInfo,
              taskEither.flatMap((customerInfo: CustomerInfo) =>
                pipe(
                  shippingAddress,
                  taskEither.flatMap((shippingAddress: Address) =>
                    pipe(
                      billingAddress,
                      taskEither.flatMap((billingAddress: Address) =>
                        pipe(
                          lines,
                          taskEither.flatMap((lines) => {
                            const validatedOrder: ValidatedOrder = {
                              OrderId: orderId,
                              CustomerInfo: customerInfo,
                              ShippingAddress: shippingAddress,
                              BillingAddress: billingAddress,
                              Lines: lines
                            }
                            return taskEither.right(validatedOrder)
                          }
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      }

const toOrderId =
  (unvalidatedOrderId: string) => {
    return pipe(
      createOrderId(unvalidatedOrderId),
      either.mapLeft((errorString: string): ValidationError => {
        return {
          type: "ValidationError",
          value: errorString
        }
      })
    )
  }

export const toAddress =
  (checkedAddress: CheckedAddress): Either<ValidationError, Address> => {


    const addressLine1 = pipe(
      checkedAddress.AddressLine1,
      createString50
    )

    const addressLine2 = pipe(
      checkedAddress.AddressLine2,
      createOptionString50
    )
    const addressLine3 = pipe(
      checkedAddress.AddressLine3,
      createOptionString50
    )

    const addressLine4 = pipe(
      checkedAddress.AddressLine4,
      createOptionString50
    )
    const city = pipe(
      checkedAddress.City,
      createString50
    )
    const zipCode = pipe(
      checkedAddress.ZipCode,
      createZipCode
    )

    const address: Address = {
      AddressLine1: addressLine1,
      AddressLine2: addressLine2,
      AddressLine3: addressLine3,
      AddressLine4: addressLine4,
      City: city,
      ZipCode: zipCode
    }
    return right(address)
  }

export const toCustomerInfo =
  (customer: UnvalidatedCustomerInfo): Either<ValidationError, CustomerInfo> => {
    const firstName = pipe(
      customer.FirstName,
      createString50
    )
    const lastName = pipe(
      customer.LastName,
      createString50
    )
    const emailAddless = pipe(
      customer.EmailAddless,
      createEmailAddress
    )
    const name: PersonalName = {
      FisrstName: firstName,
      LastName: lastName
    }
    const customerInfo: CustomerInfo = {
      Name: name,
      EmailAddress: emailAddless
    }

    return right(customerInfo)
  }

const toCheckedAddress =
  (checkAddress: CheckAddressExists) =>
    (address: UnvalidatedAddress) => {
      return pipe(
        address,
        checkAddress,
        taskEither.mapLeft((addError) => {
          return match(addError)({
            AddressNotFound: (): ValidationError => {
              return {
                type: "ValidationError",
                value: 'Address not found'
              }
            },
            InvalidFormat: (): ValidationError => {
              return {
                type: "ValidationError",
                value: " Address has bad format"
              }
            }
          })

        })

      )
    }
const toValidatedOrderLine =
  (checkProductCodeExists: CheckProductCodeExists) =>
    (unvalidatedOrderLine: UnvalidatedOrderLine): Either<ValidationError, ValidatedOrderLine> => {
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

      return right(validatedOrderLine)
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
      match(productCode)<Either<string, OrderQuantity>>({
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
                taskEither.flatMap(flow(priceOrder(getProductPrice), taskEither.fromEither))
              )
              const acknowledgmentOption = pipe(
                pricedOrderAdapted,
                taskEither.map(
                  acknowledgeOrder
                    (createOrderAcknowledgmentLetter)
                    (sendOrderAcknowledgment)
                )
              )
              const events = taskEither.ap(acknowledgmentOption)(taskEither.map(createEvents)(pricedOrderAdapted))
              return events
            }
