import { Express } from 'express';
import selfController from '../controllers/self';

module.exports = function(app: Express) {
    // a get specifying no route returns version
    app.get('/', selfController.version);
};
