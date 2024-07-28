import { either, taskEither } from "fp-ts"
import { CheckAddressExists, CheckProductCodeExists, CreateOrderAcknowledgmentLetter, GetProductPrice, placeOrder, SendOrderAcknowledgment } from "./PlaceOrder.Implemantation"
import { UnvalidatedOrder } from "./PlaceOrder.PublicTypes"
import { Decimal, Price } from "./Common.SimpleTypes"

describe("PlaceOrder", () => {
  test('placeOrder', async () => {
    const checkProductCodeExists: CheckProductCodeExists = (_) => true
    const checkAddressExists: CheckAddressExists = taskEither.right
    const getProductPrice: GetProductPrice = (_) => Price.unsafeCreate(1)
    const createOrderAcknowledgmentLetter: CreateOrderAcknowledgmentLetter = (_) => "test"
    const sendOrderAcknowledgment: SendOrderAcknowledgment = (_) => { return { type: "Sent" } }
    const unvalidatedOrder: UnvalidatedOrder = {
      OrderId: 'fdsf',
      CustomerInfo: {
        FirstName: "foo",
        LastName: "bar",
        EmailAddless: "test@exmaple.com"
      },
      ShippingAddress: {
        AddressLine1: "fds",
        AddressLine2: "fds",
        AddressLine3: "fds",
        AddressLine4: "fds",
        City: "fdsa",
        ZipCode: "12345"
      },
      BillingAddress: {
        AddressLine1: "fds",
        AddressLine2: "fds",
        AddressLine3: "fds",
        AddressLine4: "fds",
        City: "fdsa",
        ZipCode: "12345"
      },
      Lines: [{
        OrderLineId: 'fds',
        ProductCode: "W303",
        Quantity: Decimal.create(1)
      }],
    }

    expect(
      await placeOrder
        (checkProductCodeExists)
        (checkAddressExists)
        (getProductPrice)
        (createOrderAcknowledgmentLetter)
        (sendOrderAcknowledgment)
        (unvalidatedOrder)()
    ).toBe('')
  })
})
