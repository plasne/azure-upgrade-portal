"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const remediate_1 = __importDefault(require("../controllers/remediate"));
module.exports = (app) => {
    // create a remediation
    app.post('/remediate/discovery', (req, res) => {
        const job = {
            autoClose: true,
            message: JSON.stringify({ operation: 'plan start' }),
            queue: 'discovery'
        };
        return remediate_1.default.create(req, res, job);
    });
};
