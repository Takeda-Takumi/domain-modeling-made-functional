import { array, either, option, } from "fp-ts"
import { Either, } from "fp-ts/lib/Either"
import { identity, pipe } from "fp-ts/lib/function"
import { match } from "./util"

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
  static createStringOption =
    (fieldName: string) =>
      (maxLen: number) =>
        (str: string) => {
          if (this.isEmptyString(str)) {
            return either.right(option.none)
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
              return Int.create(i)
            }
          }

  static createDecimal =
    (fieldName: string) =>
      (minVal: Decimal) =>
        (maxVal: Decimal) =>
          (i: number): Either<string, Decimal> => {
            if (i < minVal.value) {
              const msg = `${fieldName}: Must not be less than ${i}`
              return either.left(msg)
            } else if (i > maxVal.value) {
              const msg = `${fieldName}: Must not be greater than ${i}`
              return either.left(msg)
            } else {
              return either.right(Decimal.create(i))
            }
          }

  static createLike =
    (fieldName: string) =>
      (pattern: RegExp) =>
        (str: string): Either<string, string> => {
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

export class Decimal {
  static readonly empty: Decimal = new Decimal(0)
  readonly value: number
  private constructor(n: number) {
    this.value = n
  }
  static create(n: number) {
    return new Decimal(n)
  }
  multiply = (other: Decimal) => new Decimal(this.value * other.value)
  sum = (other: Decimal) => new Decimal(this.value + other.value)
}

export class Int {
  static readonly empty: Int = new Int(0)
  readonly value: number
  private constructor(n: number) {
    this.value = n
  }
  static create(n: number) {
    if (Number.isInteger(n))
      return either.right(new Int(n))
    else
      return either.left(`${n} is not integer`)
  }
  multiply = (other: Int) => new Int(this.value * other.value)
  sum = (other: Int) => new Int(this.value + other.value)
}

export class String50 {
  private value: string
  private constructor(str: string) {
    this.value = str
  }

  static create =
    (fieldName: string) =>
      (str: string): Either<string, String50> => {
        return either.map(
          (value: string) => {
            return new String50(value)
          }
        )(ConstrainedType.createString(fieldName)(50)(str))
      }

  static createOption =
    (fieldName: string) =>
      (str: string) => {
        return pipe(
          ConstrainedType.createStringOption(fieldName)(50)(str),
          either.map((optionString) => pipe(
            optionString,
            option.map((str: string) => new String50(str))
          ))
        )
      }
}

export class EmailAddress {
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (str: string) => {
        const pattern = /.+@.+/
        return pipe(
          ConstrainedType.createLike(fieldName)(pattern)(str),
          either.map((value: string) => new EmailAddress(value))
        )
      }
}

export class ZipCode {
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (str: string) => {
        const pattern = /\d{5}/
        return pipe(
          ConstrainedType.createLike(fieldName)(pattern)(str),
          either.map((value: string) => new ZipCode(value))
        )
      }
}

export class OrderId {
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (str: string) => {
        return pipe(
          ConstrainedType.createString(fieldName)(50)(str),
          either.map((value: string) => new OrderId(value))
        )
      }
}

export class OrderLineId {
  private value: string
  private constructor(str: string) {
    this.value = str
  }

  static create =
    (fieldName: string) =>
      (str: string): Either<string, OrderLineId> => {
        return either.map(
          (value: string) => {
            return new OrderLineId(value)
          }
        )(ConstrainedType.createString(fieldName)(50)(str))
      }
}

export class WidgetCode {
  readonly type = 'WidgetCode'
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (str: string) => {
        const pattern = /W\d{3}/
        return pipe(
          ConstrainedType.createLike(fieldName)(pattern)(str),
          either.map((value: string) => new WidgetCode(value))
        )
      }
}

export class GizmoCode {
  readonly type = 'GizmoCode'
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (str: string) => {
        const pattern = /G\d{3}/
        return pipe(
          ConstrainedType.createLike(fieldName)(pattern)(str),
          either.map((value: string) => new GizmoCode(value))
        )
      }
}

export class ProductCodeModule {
  private value: string
  private constructor(str: string) {
    this.value = str;
  }
  static create =
    (fieldName: string) =>
      (code: string): Either<string, ProductCode> => {
        if (ConstrainedType.isEmptyString(code)) {
          const msg = `${fieldName}: Must not be null or empty`
          return either.left(msg)
        } else if (code.at(0) === "W") {
          return WidgetCode.create("WidgetCode")(code)
        } else if (code.at(0) === "G") {
          return GizmoCode.create("GizmoCode")(code)
        } else {
          const msg = `${fieldName}: Format not recognized ${code}`
          return either.left(msg)
        }
      }
}

export type ProductCode = WidgetCode | GizmoCode

export class UnitQuantity {
  readonly type = "UnitQuantity"
  readonly value: Int
  private constructor(v: Int) {
    this.value = v;
  }
  static create =
    (fieldName: string) =>
      (v: number) => {
        return pipe(
          ConstrainedType.createInt(fieldName)(1)(1000)(v),
          either.map((value: Int): UnitQuantity => new UnitQuantity(value))
        )
      }
}

export class KilogramQuantity {
  readonly type = "KilogramQuantity"
  readonly value: Decimal
  private constructor(v: Decimal) {
    this.value = v;
  }
  static create =
    (fieldName: string) =>
      (v: number) => {
        return pipe(
          ConstrainedType.createDecimal(fieldName)(Decimal.create(0.05))(Decimal.create(100))(v),
          either.map((value: Decimal): KilogramQuantity => new KilogramQuantity(value))
        )
      }
}

export type OrderQuantity = UnitQuantity | KilogramQuantity

export class OrderQuantityModule {
  static create =
    (fieldName: string) =>
      (productCode: ProductCode) =>
        (quantity: number): Either<string, OrderQuantity> => {
          return match(productCode)<Either<string, OrderQuantity>>({
            WidgetCode: (_) => UnitQuantity.create(fieldName)(quantity),
            GizmoCode: (_) => KilogramQuantity.create(fieldName)(quantity)
          })
        }

  static value =
    (qty: OrderQuantity): Decimal => {
      return match(qty)({
        UnitQuantity: (uq): Decimal => Decimal.create(uq.value.value),
        KilogramQuantity: (kq) => kq.value
      })
    }

}


export class Price {
  readonly value: Decimal
  private constructor(v: Decimal) {
    this.value = v;
  }

  static unsafeCreate =
    (v: number) => pipe(
      this.create(v),
      either.match(
        (e) => { throw new Error(`Not expecting Price to be out of bounds: ${e}`) },
        identity<Price>
      )
    )

  static create =
    (v: number) => {
      return pipe(
        ConstrainedType.createDecimal("Price")(Decimal.create(0))(Decimal.create(1000))(v),
        either.map((value: Decimal): Price => new Price(value))
      )
    }
  static multiply =
    (qty: Decimal) =>
      (p: Price): Either<string, Price> => this.create((qty.multiply(p.value)).value)

}

export class BillingAmount {
  readonly value: Decimal
  private constructor(v: Decimal) {
    this.value = v;
  }
  static create =
    (v: number) => {
      return pipe(
        ConstrainedType.createDecimal("BillingAmount")(Decimal.create(0.0))(Decimal.create(10000))(v),
        either.map((value: Decimal): BillingAmount => new BillingAmount(value))
      )
    }

  static sumPrices =
    (prices: Price[]) => {
      const total = pipe(
        prices,
        array.map(price => price.value),
        array.reduce(Decimal.empty, (acc: Decimal, cur: Decimal) => cur.sum(acc))
      )
      return this.create(total.value)
    }

}

