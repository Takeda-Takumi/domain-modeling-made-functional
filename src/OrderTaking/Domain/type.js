"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
function match(value) {
    return function (patterns) {
        const tag = value.type;
        return patterns[tag](value);
    };
}
exports.match = match;
