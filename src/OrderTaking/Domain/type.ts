import { EmailAddress, int, OrderLineId, OrderQuantity, ProductCode } from "../Common.SimpleTypes"
import { OrderId } from "./OrderId"

type Individual<
  TCoproduct extends Record<"type", keyof any>,
  Tag extends TCoproduct["type"],
> = Extract<TCoproduct, Record<"type", Tag>>;

export function match<TCoproduct extends Record<"type", keyof any>>(
  value: TCoproduct,
) {
  return function <TOut>(
    patterns: {
      [K in TCoproduct["type"]]: (
        param: Individual<TCoproduct, K>
      ) => TOut;
    },
  ): TOut {
    const tag: TCoproduct["type"] = value.type;
    return patterns[tag](value as any);
  };
}

type NonEmptyList<T> = {
  First: T
  Rest: T[]
}

export type CustomerId = int

export type ShippingAddress = never
export type BillingAddress = never
export type Price = never
export type BillingAmount = never


type OrderLine = {
  Id: OrderLineId
  OrderId: OrderId
  ProductCode: ProductCode
  OrderQuantity: OrderQuantity
}

type AcknowledgmentSent = never
type OrderPlaced = never

type VerifiedEmailAddress = never

type CustomerEmail = {
  Unverified: EmailAddress,
  Verified: VerifiedEmailAddress
}


export type HtmlString = string
export type OrderAcknowledgment = {
  EmailAddress: EmailAddress
  Letter: HtmlString
}

type Sent = never
type NotSent = never
export type SendResult = Sent | NotSent



