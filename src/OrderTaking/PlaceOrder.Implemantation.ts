import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import { Address, CustomerInfo, PersonalName } from "./Common.CompoundTypes"
import { BillableOrderPlaced, OrderAcknowledgmentSent, OrderPlaced, PlaceOrderEvent, PlaceOrderWorkflow, PricingError, UnvalidatedAddress, UnvalidatedCustomerInfo, UnvalidatedOrder, UnvalidatedOrderLine, ValidationError } from "./PlaceOrder.PublicTypes"
import { BillingAmount, Decimal, EmailAddress, GizmoCode, OrderId, OrderLineId, OrderQuantity, OrderQuantityModule, Price, ProductCode, ProductCodeModule, String50, WidgetCode, ZipCode } from "./Common.SimpleTypes"
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

export type CheckProductCodeExists =
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



export type GetProductPrice =
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
      unvalidatedOrderId,
      OrderId.create("OrderId"),
      either.mapLeft((errorString: string): ValidationError => {
        return {
          type: "ValidationError",
          value: errorString
        }
      }),
    )
  }

export const toAddress =
  (checkedAddress: CheckedAddress): Either<ValidationError, Address> => {
    const addressLine1 = pipe(
      checkedAddress.AddressLine1,
      String50.create("AddressLine1"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )

    const addressLine2 = pipe(
      checkedAddress.AddressLine2,
      String50.createOption("AddressLine2"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    const addressLine3 = pipe(
      checkedAddress.AddressLine3,
      String50.createOption("AddressLine3"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )

    const addressLine4 = pipe(
      checkedAddress.AddressLine4,
      String50.createOption("AddressLine4"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    const city = pipe(
      checkedAddress.City,
      String50.create("City"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    const zipCode = pipe(
      checkedAddress.ZipCode,
      ZipCode.create("ZipCode"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )

    return pipe(addressLine1, either.flatMap((addressLine1: String50) =>
      pipe(city, either.flatMap((city: String50) =>
        pipe(zipCode, either.flatMap((zipCode: ZipCode) =>
          pipe(addressLine2, either.flatMap((addressLine2) =>
            pipe(addressLine3, either.flatMap((addressLine3) =>
              pipe(addressLine4, either.map((addressLine4): Address => {
                const address: Address = {
                  AddressLine1: addressLine1,
                  AddressLine2: addressLine2,
                  AddressLine3: addressLine3,
                  AddressLine4: addressLine4,
                  City: city,
                  ZipCode: zipCode
                }
                return address
              }))
            ))
          ))
        ))
      ))
    ))
  }

export const toCustomerInfo =
  (customer: UnvalidatedCustomerInfo): Either<ValidationError, CustomerInfo> => {
    const firstName = pipe(
      customer.FirstName,
      String50.create("FirstName"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    const lastName = pipe(
      customer.LastName,
      String50.create("LastName"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    const emailAddless = pipe(
      customer.EmailAddless,
      EmailAddress.create("EmailAddress"),
      either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      })
    )
    return pipe(firstName, either.flatMap((firstName: String50) =>
      pipe(lastName, either.flatMap((lastName: String50) =>
        pipe(emailAddless, either.map((emailAddless: EmailAddress) => {
          const customerInfo: CustomerInfo = {
            Name: { FisrstName: firstName, LastName: lastName },
            EmailAddress: emailAddless
          }
          return customerInfo
        }))
      ))
    ))
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
        OrderLineId.create("OrderLineId"),
        either.mapLeft((e): ValidationError => {
          return {
            type: "ValidationError",
            value: e
          }
        })
      )
      const productCode = pipe(
        unvalidatedOrderLine.ProductCode,
        toProductCode(checkProductCodeExists),
        either.mapLeft((e): ValidationError => {
          return {
            type: "ValidationError",
            value: e
          }
        })
      )
      const quantity = pipe(
        productCode,
        either.flatMap((productCode: ProductCode) => toOrderQuantity(productCode)(unvalidatedOrderLine.Quantity))
      )

      return pipe(
        orderLineId,
        either.flatMap((orderLineId: OrderLineId) =>
          pipe(productCode, either.flatMap((productCode: ProductCode) =>
            pipe(quantity, either.map((quantity: OrderQuantity) => {
              const validatedOrderLine: ValidatedOrderLine = {
                OrderLineId: orderLineId,
                ProductCode: productCode,
                Quantity: quantity
              }
              return validatedOrderLine
            }))
          ))
        )
      )
    }

const toProductCode =
  (checkProductCodeExists: CheckProductCodeExists) =>
    (productCode: string) => {
      const checkProduct =
        (productCode: ProductCode) => {
          if (checkProductCodeExists(productCode)) {
            return either.right(productCode)
          } else {
            const msg = `Invalid: ${productCode}`
            return either.left(msg)
          }
        }

      return pipe(
        productCode,
        ProductCodeModule.create("ProductCode"),
        either.flatMap(checkProduct),
      )
    }
const toOrderQuantity =
  (productCode: ProductCode) =>
    (quantity: Decimal): Either<ValidationError, OrderQuantity> =>
      pipe(OrderQuantityModule.create("OrderQuantity")(productCode)(quantity.value), either.mapLeft((e): ValidationError => {
        return {
          type: "ValidationError",
          value: e
        }
      }))


const toPricedOrderLine =
  (getProductPrice: GetProductPrice) =>
    (validatedOrderLine: ValidatedOrderLine): Either<PricingError, PricedOrderLine> => {
      const qty = pipe(validatedOrderLine.Quantity, OrderQuantityModule.value)
      const price = pipe(validatedOrderLine.ProductCode, getProductPrice)
      const linePrice = pipe(
        Price.multiply(qty)(price),
        either.mapLeft((errorString: string): PricingError => {
          return {
            type: "PricingError",
            value: errorString
          }
        }))
      return either.map((linePrice: Price) => {
        const pricedLine: PricedOrderLine = {
          OrderLineId: validatedOrderLine.OrderLineId,
          ProductCode: validatedOrderLine.ProductCode,
          Quantity: validatedOrderLine.Quantity,
          LinePrice: linePrice
        }
        return pricedLine
      })(linePrice)
    }

const priceOrder: PriceOrder =
  (getProductPrice: GetProductPrice) =>
    (validateOrder: ValidatedOrder) => {
      const lines = pipe(
        validateOrder.Lines,
        array.map(toPricedOrderLine(getProductPrice)),
        array.sequence(either.Applicative)
      )
      const amountToBill = pipe(
        lines,
        either.map(array.map(line => line.LinePrice)),
        either.flatMap((prices: Price[]) => {
          const total = BillingAmount.sumPrices(prices)
          return pipe(
            total,
            either.mapLeft((e): PricingError => {
              return {
                type: "PricingError",
                value: e
              }
            }))
        }),
      )
      return pipe(lines, either.flatMap((lines) =>
        pipe(amountToBill, either.map((amountToBill) => {
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
        ))
      ))
    }

export type HtmlString = string

export type CreateOrderAcknowledgmentLetter =
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

export type SendOrderAcknowledgment =
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
    if (billingAmount.value > 0) {
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

export const placeOrder =
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
