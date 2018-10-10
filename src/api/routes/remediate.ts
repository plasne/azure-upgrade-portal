import { Express } from 'express';
import controller from '../controllers/remediate';

module.exports = (app: Express) => {
    // create a remediation
    app.post('/remediate', controller.create);
};
