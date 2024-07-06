import { EnvelopeContents, PlaceOrderEvents, UnvalidateOrder, ValidationResponse } from "./type";

type ValidateOrder = (arg: UnvalidateOrder) => ValidationResponse<ValidateOrder>
type PlaceOrder = (arg: UnvalidateOrder) => PlaceOrderEvents
type CategorizeInboundMail = (arg: EnvelopeContents) => CategorizeInboundMail

