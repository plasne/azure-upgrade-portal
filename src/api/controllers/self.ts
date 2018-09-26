import { Request, Response } from 'express';

export default {
    /** Returns the application and version to the caller. */
    version: (_: Request, res: Response) => {
        res.send({
            application: 'Azure Upgrade Portal API',
            version: process.env.npm_package_version || 'unknown'
        });
    }
};
