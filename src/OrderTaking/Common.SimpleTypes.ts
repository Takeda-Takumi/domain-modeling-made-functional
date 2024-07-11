import { array, either, monoid, option } from "fp-ts"
import { Either, left, right } from "fp-ts/lib/Either"
import { flip, identity, pipe } from "fp-ts/lib/function"
import { MonoidSum } from "fp-ts/lib/number"
import { Option } from "fp-ts/lib/Option"
import { match } from "./util"
import { Monoid } from "fp-ts/lib/Monoid"

class ConstrainedType {
  static isEmptyString(str: string) {
    if (str === undefined || str === null || str === '') {
      return true
    } else {
      return false
    }
  }
  static createString =
    (fieldName: string) =>
      (maxLen: number) =>
        (str: string): Either<string, string> => {
          if (this.isEmptyString(str)) {
            return either.left(`${fieldName} must not be null or empty`)
          } else if (str.length > maxLen) {
            return either.left(`${fieldName} must not be more than ${maxLen} chars`)
          } else {
            return either.right(str)
          }
        }
  static createOptionString50(fieldName: string, maxLen: number, str: string) {
    if (this.isEmptyString(str)) {
      return either.left(option.none)
    } else if (str.length > maxLen) {
      return either.left(`${fieldName} must not be more than ${maxLen} chars`)
    } else {
      return either.right(option.some(str))
    }
  }
  static createInt =
    (fieldName: string) =>
      (minVal: number) =>
        (maxVal: number) =>
          (i: number): Either<string, Int> => {
            if (!Number.isInteger(i)) {
              const msg = `${fieldName}: Must be Int`
              return either.left(msg)
            } else if (i < minVal) {
              const msg = `${fieldName}: Must not be less than ${i}`
              return either.left(msg)
            } else if (i > maxVal) {
              const msg = `${fieldName}: Must not be greater than ${i}`
              return either.left(msg)
            } else {
              return either.right(
                {
                  type: "Int",
                  value: i
                }
              )
            }
          }

  static createDecimal =
    (fieldName: string) =>
      (minVal: number) =>
        (maxVal: number) =>
          (i: number): Either<string, Decimal> => {
            if (i < minVal) {
              const msg = `${fieldName}: Must not be less than ${i}`
              return either.left(msg)
            } else if (i > maxVal) {
              const msg = `${fieldName}: Must not be greater than ${i}`
              return either.left(msg)
            } else {
              return either.right(
                {
                  type: 'Decimal',
                  value: i
                }
              )
            }
          }

  static createLike(fieldName: string, pattern: RegExp, str: string): Either<string, string> {
    if (this.isEmptyString(str)) {
      return either.left(`${fieldName} must not be null or empty`)
    } else if (pattern.test(str)) {
      return either.right(str)
    } else {
      const msg = `${fieldName}: ${str} must match the pattern ${pattern}`
      return either.left(msg)
    }
  }
}
export type Decimal = {
  type: "Decimal"
  value: number
}
const monoidSumDecimal: Monoid<Decimal> = {
  concat: (x, y) => { return { type: "Decimal", value: x.value + y.value } },
  empty: { type: "Decimal", value: 0 }
}

export type Int = {
  type: "Int"
  value: number
}

export const createInt = ConstrainedType.createInt("Int")(Number.MIN_VALUE)(Number.MAX_VALUE)

export const createDecimal = ConstrainedType.createDecimal("Decimal")(Number.MIN_VALUE)(Number.MAX_VALUE)

export type String50 = {
  type: "String50"
  value: string
}

export const createString50 = (str: string): Either<string, String50> => {
  return either.map(
    (value: string): String50 => {
      return {
        type: "String50",
        value: value
      }
    }
  )(ConstrainedType.createString("String50")(50)(str))
}

export const createOptionString50 = (str: string): Option<String50> => {
  if (str == undefined) {
    return option.none
  } else if (str === null || str === '') {
    return option.none
  } else if (str.length > 50) {
    return option.none
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
  (str: string): Either<string, ZipCode> => {
    //TODO: validate
    return either.right({
      type: "ZipCode",
      value: str
    })
  }

export type OrderLineId = {
  type: "OrderLineId"
  value: string
}
export const createOrderLineId = (str: string): Either<string, OrderLineId> => {
  return either.map(
    (value: string): OrderLineId => {
      return {
        type: "OrderLineId",
        value: value
      }
    }
  )(ConstrainedType.createString("OrderLineId")(50)(str))
}


export type WidgetCode = {
  type: "WidgetCode"
  value: string
}
export const createWidgetCode = (str: string): Either<string, WidgetCode> => {
  const pattern = /W\d{3}/
  return either.map((value: string): WidgetCode => {
    return {
      type: "WidgetCode",
      value: value
    }
  }

  )(ConstrainedType.createLike("WidgetCode", pattern, str))
}
export type GizmoCode = {
  type: "GizmoCode"
  value: string
}

export const createGizmoCode = (str: string): Either<string, GizmoCode> => {
  const pattern = /W\d{3}/
  return either.map((value: string): GizmoCode => {
    return {
      type: "GizmoCode",
      value: value
    }
  }

  )(ConstrainedType.createLike("WidgetCode", pattern, str))
}
export type ProductCode = WidgetCode | GizmoCode
export const createProductCode =
  (fieldName: string) =>
    (code: string): Either<string, ProductCode> => {
      if (ConstrainedType.isEmptyString(code)) {
        const msg = `${fieldName}: Must not be null or empty`
        return either.left(msg)
      } else if (code.at(0) === "W") {
        return createWidgetCode(code)
      } else if (code.at(0) === "G") {
        return createGizmoCode(code)
      } else {
        const msg = `${fieldName}: Format not recognized ${code}`
        return either.left(msg)
      }
    }

export type UnitQuantity = {
  readonly type: "UnitQuantity"
  readonly value: Int
}
export const createUnitQuantity = (quantity: Int): Either<string, UnitQuantity> => {
  return either.map(
    (value: Int): UnitQuantity => {
      return {
        type: "UnitQuantity",
        value: value
      }
    }
  )(ConstrainedType.createInt("UnitQuantity")(1)(1000)(quantity.value))
}

type KilogramQuantity = {
  type: "KilogramQuantity"
  value: Decimal
}
export const createKilogramQuantity = (quantity: Decimal): Either<string, KilogramQuantity> => {
  return either.map(
    (value: Decimal): KilogramQuantity => {
      return {
        type: "KilogramQuantity",
        value: value
      }
    }
  )(ConstrainedType.createDecimal("KilogramQuantity")(1)(1000)(quantity.value))
}
export type OrderQuantity = UnitQuantity | KilogramQuantity
export type valueOrderQuantity = (qty: OrderQuantity) => {
}

export const createOrderQuantity =
  (productCode: ProductCode) =>
    (quantity: number): Either<string, OrderQuantity> => {
      return match(productCode)<Either<string, OrderQuantity>>({
        WidgetCode: (_) => either.flatMap(createUnitQuantity)(createInt(quantity)),
        GizmoCode: (_) => either.flatMap(createKilogramQuantity)(createDecimal(quantity))
      })
    }
export const valueOrderQuantity = (qty: OrderQuantity) => {
  return match(qty)({
    UnitQuantity: (uq): Decimal => { return { type: "Decimal", value: uq.value.value } },
    KilogramQuantity: (kq) => kq.value
  })
}

export type Price = {
  type: "Price"
  value: Decimal
}

export const multiplyPrice =
  (qty: Decimal) =>
    (p: Price): Either<string, Price> => {
      return either.map(
        (value: Decimal): Price => {
          return {
            type: "Price",
            value: value
          }
        }
      )(createDecimal(p.value.value * qty.value))
    }


export type BillingAmount = {
  type: "BillingAmount"
  value: Decimal
}
export const sumPricesBillingAmount =
  (prices: Price[]): BillingAmount => {
    const total = pipe(
      prices,
      array.map(price => price.value),
      array.foldMap(monoidSumDecimal)(identity)
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
  return either.map((value: string): OrderId => {
    return {
      type: "OrderId",
      value: value
    }
  })(ConstrainedType.createString("OrderId")(50)(id))
}

