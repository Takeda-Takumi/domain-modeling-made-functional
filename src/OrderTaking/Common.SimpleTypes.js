"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumPricesBillingAmount = exports.createOrderQuantity = exports.createKilogramQuantity = exports.createUnitQuantity = exports.createProductCode = exports.createOrderLineId = exports.createZipCode = exports.createEmailAddress = exports.createOptionString50 = exports.createString50 = exports.createInt = void 0;
const fp_ts_1 = require("fp-ts");
const function_1 = require("fp-ts/lib/function");
const number_1 = require("fp-ts/lib/number");
const createInt = (num) => {
    throw new Error();
};
exports.createInt = createInt;
const createString50 = (str) => {
    if (str === undefined || str === null || str === '') {
        throw new Error();
    }
    else if (str.length > 50) {
        throw new Error();
    }
    else {
        return {
            type: "String50",
            value: str
        };
    }
};
exports.createString50 = createString50;
const createOptionString50 = (str) => {
    if (str == undefined) {
        throw new Error();
    }
    else if (str === null || str === '') {
        return fp_ts_1.option.none;
    }
    else if (str.length > 50) {
        throw new Error();
    }
    else {
        return fp_ts_1.option.of({
            type: "String50",
            value: str
        });
    }
};
exports.createOptionString50 = createOptionString50;
const createEmailAddress = (str) => {
    //TODO: validate
    return {
        type: "EmailAddress",
        value: str
    };
};
exports.createEmailAddress = createEmailAddress;
const createZipCode = (str) => {
    //TODO: validate
    return {
        type: "ZipCode",
        value: str
    };
};
exports.createZipCode = createZipCode;
const createOrderLineId = (str) => {
    throw new Error;
    return {};
};
exports.createOrderLineId = createOrderLineId;
const createProductCode = (str) => {
    throw new Error;
};
exports.createProductCode = createProductCode;
const createUnitQuantity = (qty) => {
    throw new Error();
};
exports.createUnitQuantity = createUnitQuantity;
const createKilogramQuantity = (qty) => {
    throw new Error();
};
exports.createKilogramQuantity = createKilogramQuantity;
const createOrderQuantity = (productCode) => (quantity) => {
    throw new Error();
};
exports.createOrderQuantity = createOrderQuantity;
const sumPricesBillingAmount = (prices) => {
    const total = (0, function_1.pipe)(prices, fp_ts_1.array.map(price => price.value), fp_ts_1.array.foldMap(number_1.MonoidSum)(function_1.identity));
    return total;
};
exports.sumPricesBillingAmount = sumPricesBillingAmount;
