export type OrderId = {
  type: "OrderId",
  value: string
}

export const create = (id: string): OrderId => {
  if (id === '') throw Error()
  else if (id.length > 50) throw Error()
  else {
    return {
      type: "OrderId",
      value: id
    }
  }
}
