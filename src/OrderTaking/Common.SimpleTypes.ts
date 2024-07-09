import { array, monoid, option } from "fp-ts"
import { Either, left, right } from "fp-ts/lib/Either"
import { flip, identity, pipe } from "fp-ts/lib/function"
import { MonoidSum } from "fp-ts/lib/number"
import { Option } from "fp-ts/lib/Option"

export type decimal = number
export type int = number
export const createInt = (num: number): int => {
  throw new Error()
}

export type String50 = {
  type: "String50"
  value: string
}

export const createString50 = (str: string): String50 => {
  if (str === undefined || str === null || str === '') {
    throw new Error()
  } else if (str.length > 50) {
    throw new Error()
  } else {
    return {
      type: "String50",
      value: str
    }
  }
}

export const createOptionString50 = (str: string): Option<String50> => {
  if (str == undefined) {
    throw new Error()
  } else if (str === null || str === '') {
    return option.none
  } else if (str.length > 50) {
    throw new Error()
  } else {
    return option.of<String50>({
      type: "String50",
      value: str
    })
  }
}

export type EmailAddress = {
  type: "EmailAddress"
  value: string
}
export const createEmailAddress =
  (str: string): EmailAddress => {
    //TODO: validate
    return {
      type: "EmailAddress",
      value: str
    }
  }

export type ZipCode = {
  type: "ZipCode"
  value: string
}
export const createZipCode =
  (str: string): ZipCode => {
    //TODO: validate
    return {
      type: "ZipCode",
      value: str
    }
  }

export type OrderLineId = {
  type: "OrderLineId"
  value: string
}
export const createOrderLineId = (str: string) => {
  throw new Error;
  return {} as OrderLineId
}


export type WidgetCode = {
  type: "WidgetCode"
  value: string
}
export type GizmoCode = {
  type: "GizmoCode"
  value: string
}
export type ProductCode = WidgetCode | GizmoCode
export const createProductCode = (str: string): ProductCode => {
  throw new Error;
}

export type UnitQuantity = {
  readonly type: "UnitQuantity"
  readonly value: int
}
export const createUnitQuantity = (quantity: int): Either<string, UnitQuantity> => {
  if (quantity < 1) {
    return left('UnitQuantity can not be negative')
  } else if (quantity > 1000) {
    return left("UnitQuantity can not be more than 1000")
  } else {
    return right({
      type: "UnitQuantity",
      value: quantity
    })
  }
}

type KilogramQuatity = decimal
export const createKilogramQuantity = (qty: decimal): Either<string, KilogramQuatity> => {
  throw new Error()
}
export type OrderQuantity = UnitQuantity | KilogramQuatity
export const createOrderQuantity =
  (productCode: ProductCode) =>
    (quantity: decimal): OrderQuantity => {
      throw new Error()
    }

export type Price = {
  type: "Price"
  value: decimal
}

export type BillingAmount = {
  type: "BillingAmount"
  value: decimal
}
export const sumPricesBillingAmount =
  (prices: Price[]): BillingAmount => {
    const total = pipe(
      prices,
      array.map(price => price.value),
      array.foldMap(MonoidSum)(identity)
    )
    return {
      type: "BillingAmount",
      value: total
    }
  }

export type OrderId = {
  type: "OrderId",
  value: string
}

export const createOrderId = (id: string): Either<string, OrderId> => {
  if (id === '') return left('createOrderId')
  else if (id.length > 50) return left('createOrderId')
  else {
    return right({
      type: "OrderId",
      value: id
    })
  }
}


