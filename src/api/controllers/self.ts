import { Request, Response } from 'express';

export default {
    /** Returns the application and version to the caller. */
    version: async (_: Request, res: Response) => {
        res.send({
            application: 'Azure Upgrade Portal API',
            version: await global.version()
        });
    }
};
