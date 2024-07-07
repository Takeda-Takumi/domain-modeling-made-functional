import { pipe } from "fp-ts/lib/function"
import { create } from "./UnitQuantity"
import * as E from 'fp-ts/Either'

describe('UnitQunatity', () => {
  test('test', () => {
    expect(
      pipe(
        -1,
        create,
        E.match(
          (e) => e,
          (quantity) => `${quantity.value}`
        ),
      )
    ).toBe('fdsf')
  })
})
