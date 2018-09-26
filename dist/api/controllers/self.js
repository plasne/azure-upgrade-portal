"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /** Returns the application and version to the caller. */
    version: (_, res) => {
        res.send({
            application: 'Azure Upgrade Portal API',
            version: process.env.npm_package_version || 'unknown'
        });
    }
};
