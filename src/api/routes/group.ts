import { Express } from 'express';
import selfController from '../controllers/self';

module.exports = (app: Express) => {
    // a get specifying no route returns version
    app.get('/groups/', selfController.version);
};
