import { pipe } from "fp-ts/lib/function"
import { Address, CustomerInfo, PersonalName } from "./Common.CompoundTypes"
import { createEmailAddress, createOptionString50, createString50, createZipCode } from "./Common.SimpleTypes"
import { CheckAddressExists } from "./PlaceOrder.Implemantation"
import { UnvalidatedAddress, UnvalidatedCustomerInfo } from "./PlaceOrder.PublicTypes"

export const toCunstomerInfo =
  (customer: UnvalidatedCustomerInfo): CustomerInfo => {
    const firstName = pipe(
      customer.FirstName,
      createString50
    )
    const lastName = pipe(
      customer.LastName,
      createString50
    )
    const emailAddless = pipe(
      customer.EmailAddless,
      createEmailAddress
    )
    const name: PersonalName = {
      FisrstName: firstName,
      LastName: lastName
    }
    const customerInfo: CustomerInfo = {
      Name: name,
      EmailAddress: emailAddless
    }

    return customerInfo
  }

export const toAddress =
  (checkAddressExists: CheckAddressExists) =>
    (unvalidatedAddress: UnvalidatedAddress) => {
      const checkedAddress = checkAddressExists(unvalidatedAddress)


      const addressLine1 = pipe(
        checkedAddress.AddressLine1,
        createString50
      )

      const addressLine2 = pipe(
        checkedAddress.AddressLine2,
        createOptionString50
      )
      const addressLine3 = pipe(
        checkedAddress.AddressLine3,
        createOptionString50
      )

      const addressLine4 = pipe(
        checkedAddress.AddressLine4,
        createOptionString50
      )
      const city = pipe(
        checkedAddress.City,
        createString50
      )
      const zipCode = pipe(
        checkedAddress.ZipCode,
        createZipCode
      )

      const address: Address = {
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        AddressLine3: addressLine3,
        AddressLine4: addressLine4,
        City: city,
        ZipCode: zipCode
      }
      return address
    }

