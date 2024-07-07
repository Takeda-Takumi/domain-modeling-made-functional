"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("fp-ts/lib/function");
const OrderId_1 = require("./Domain/OrderId");
const PlaceOrder_Dto_1 = require("./PlaceOrder.Dto");
const type_1 = require("./Domain/type");
const Common_SimpleTypes_1 = require("./Common.SimpleTypes");
const fp_ts_1 = require("fp-ts");
const validateOrder = (checkProductCodeExist) => (checkAddressExists) => (unvalidatedOrder) => {
    const orderId = (0, function_1.pipe)(unvalidatedOrder.OrderId, OrderId_1.createOrderId);
    const customerInfo = (0, function_1.pipe)(unvalidatedOrder.CustomerInfo, PlaceOrder_Dto_1.toCunstomerInfo);
    const shippingAddress = (0, function_1.pipe)(unvalidatedOrder.ShippingAddress, (0, PlaceOrder_Dto_1.toAddress)(checkAddressExists));
    const orderLines = (0, function_1.pipe)(unvalidatedOrder.Lines, fp_ts_1.array.map(toValidatedOrderLine(checkProductCodeExist)));
    return {};
};
const toValidatedOrderLine = (checkProductCodeExist) => (unvalidatedOrderLine) => {
    const orderLineId = (0, function_1.pipe)(unvalidatedOrderLine.OrderLineId, Common_SimpleTypes_1.createOrderLineId);
    const productCode = (0, function_1.pipe)(unvalidatedOrderLine.ProductCode, toProductCode(checkProductCodeExist));
    const quantity = (0, function_1.pipe)(unvalidatedOrderLine.Quantity, toOrderQuantity(productCode));
    const validatedOrderLine = {
        OrderLineId: orderLineId,
        ProductCode: productCode,
        Quantity: quantity
    };
    return validatedOrderLine;
};
const predicateToPassthru = (errorMsg) => (f) => (x) => {
    if (f(x)) {
        return x;
    }
    else {
        throw new Error(errorMsg);
    }
};
const toProductCode = (checkProductCodeExist) => (productCode) => {
    const checkProduct = (productCode) => {
        const errorMsg = "Invalid";
        return predicateToPassthru(errorMsg)(checkProductCodeExist)(productCode);
    };
    return (0, function_1.pipe)(productCode, Common_SimpleTypes_1.createProductCode, checkProduct);
};
const toOrderQuantity = (productCode) => (quantity) => {
    (0, type_1.match)(productCode)({
        WidgetCode: (widgetCode) => {
            return (0, function_1.pipe)(quantity, Common_SimpleTypes_1.createInt, Common_SimpleTypes_1.createUnitQuantity);
        },
        GizmoCode: (gizmoCode) => {
            return (0, function_1.pipe)(quantity, Common_SimpleTypes_1.createKilogramQuantity);
        }
    });
    return (0, Common_SimpleTypes_1.createOrderQuantity)(productCode)(quantity);
};
const toPricedOrderLine = (getProductPrice) => (line) => {
    throw new Error();
    return {};
};
const priceOrder = (getProductPrice) => (validateOrder) => {
    const lines = (0, function_1.pipe)(validateOrder.Lines, fp_ts_1.array.map(toPricedOrderLine(getProductPrice)));
    const amountToBill = (0, function_1.pipe)(lines, fp_ts_1.array.map((line) => line.LinePrice), Common_SimpleTypes_1.sumPricesBillingAmount);
    const pricedOrder = {
        OrderId: validateOrder.OrderId,
        CustomerInfo: validateOrder.CustomerInfo,
        ShippingAddress: validateOrder.ShippingAddress,
        BillingAddress: validateOrder.BillingAddress,
        Lines: lines,
        AmountToBill: amountToBill
    };
    return pricedOrder;
};
