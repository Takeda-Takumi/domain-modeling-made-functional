import { Either } from "fp-ts/lib/Either";
import { PlaceOrderError, PlaceOrderEvents, UnvalidateOrder, ValidationResponse } from "./type";

type ValidateOrder = (arg: UnvalidateOrder) => ValidationResponse<ValidateOrder>
type PlaceOrder = (arg: UnvalidateOrder) => Either<PlaceOrderError, PlaceOrderEvents>
