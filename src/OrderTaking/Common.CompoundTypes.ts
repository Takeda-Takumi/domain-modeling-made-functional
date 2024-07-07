import { Option } from "fp-ts/lib/Option"
import { EmailAddress, String50, ZipCode } from "./Common.SimpleTypes"

export type PersonalName = {
  FisrstName: String50
  LastName: String50
}
export type CustomerInfo = {
  Name: PersonalName
  EmailAddress: EmailAddress
}

export type Address = {
  AddressLine1: String50
  AddressLine2: Option<String50>
  AddressLine3: Option<String50>
  AddressLine4: Option<String50>
  City: String50
  ZipCode: ZipCode
}
