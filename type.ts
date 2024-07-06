import { number } from "fp-ts"

type decimal = number
type int = number

type CustomerId = int
type WidgetCode = string
type UnitQuantity = int
type KilogramQuatity = decimal

type CustomerInfo = never
type ShippingAddress = never
type BillingAddress = never
type OrderLine = never
type BillingAmount = never

type Order = {
  CustomerInfo: CustomerInfo
  ShippingAddress: ShippingAddress
  BillingAddress: BillingAddress
  OrderLines: OrderLine[]
  AmountToBill: BillingAmount
}
