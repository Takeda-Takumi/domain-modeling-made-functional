import { Either, left, right } from "fp-ts/lib/Either";
import { int, UnitQuantity } from "../Common.SimpleTypes";


export const create = (quantity: int): Either<string, UnitQuantity> => {
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

