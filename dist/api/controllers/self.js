"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /** Returns the application and version to the caller. */
    version: async (_, res) => {
        res.send({
            application: 'Azure Upgrade Portal API',
            version: await global.version()
        });
    }
};
