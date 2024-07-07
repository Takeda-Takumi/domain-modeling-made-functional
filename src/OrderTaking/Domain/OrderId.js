"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderId = void 0;
const createOrderId = (id) => {
    if (id === '')
        throw Error();
    else if (id.length > 50)
        throw Error();
    else {
        return {
            type: "OrderId",
            value: id
        };
    }
};
exports.createOrderId = createOrderId;
