"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAddress = exports.toCunstomerInfo = void 0;
const function_1 = require("fp-ts/lib/function");
const Common_SimpleTypes_1 = require("./Common.SimpleTypes");
const toCunstomerInfo = (customer) => {
    const firstName = (0, function_1.pipe)(customer.FirstName, Common_SimpleTypes_1.createString50);
    const lastName = (0, function_1.pipe)(customer.LastName, Common_SimpleTypes_1.createString50);
    const emailAddless = (0, function_1.pipe)(customer.EmailAddless, Common_SimpleTypes_1.createEmailAddress);
    const name = {
        FisrstName: firstName,
        LastName: lastName
    };
    const customerInfo = {
        Name: name,
        EmailAddress: emailAddless
    };
    return customerInfo;
};
exports.toCunstomerInfo = toCunstomerInfo;
const toAddress = (checkAddressExists) => (unvalidatedAddress) => {
    const checkedAddress = checkAddressExists(unvalidatedAddress);
    const addressLine1 = (0, function_1.pipe)(checkedAddress.AddressLine1, Common_SimpleTypes_1.createString50);
    const addressLine2 = (0, function_1.pipe)(checkedAddress.AddressLine2, Common_SimpleTypes_1.createOptionString50);
    const addressLine3 = (0, function_1.pipe)(checkedAddress.AddressLine3, Common_SimpleTypes_1.createOptionString50);
    const addressLine4 = (0, function_1.pipe)(checkedAddress.AddressLine4, Common_SimpleTypes_1.createOptionString50);
    const city = (0, function_1.pipe)(checkedAddress.City, Common_SimpleTypes_1.createString50);
    const zipCode = (0, function_1.pipe)(checkedAddress.ZipCode, Common_SimpleTypes_1.createZipCode);
    const address = {
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        AddressLine3: addressLine3,
        AddressLine4: addressLine4,
        City: city,
        ZipCode: zipCode
    };
    return address;
};
exports.toAddress = toAddress;
