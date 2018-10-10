import { Request, Response } from 'express';

export default {
    /** Returns the application. */
    version: async (_: Request, res: Response) => {
        res.send({
            application: 'groupsapi'
        });
    }
};
