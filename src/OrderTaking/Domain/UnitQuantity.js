"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const Either_1 = require("fp-ts/lib/Either");
const create = (quantity) => {
    if (quantity < 1) {
        return (0, Either_1.left)('UnitQuantity can not be negative');
    }
    else if (quantity > 1000) {
        return (0, Either_1.left)("UnitQuantity can not be more than 1000");
    }
    else {
        return (0, Either_1.right)({
            type: "UnitQuantity",
            value: quantity
        });
    }
};
exports.create = create;
