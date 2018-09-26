"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const self_1 = __importDefault(require("../controllers/self"));
module.exports = function (app) {
    // a get specifying no route returns version
    app.get('/', self_1.default.version);
};
