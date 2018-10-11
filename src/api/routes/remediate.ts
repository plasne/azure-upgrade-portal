import { Express } from 'express';
import { ICreateJob } from '../../jobs/Job';
import controller from '../controllers/remediate';

module.exports = (app: Express) => {
    // create a remediation
    app.post('/remediate/discovery', (req, res) => {
        const job: ICreateJob = {
            autoClose: true,
            message: JSON.stringify({ operation: 'plan start' }),
            queue: 'discovery'
        };
        return controller.create(req, res, job);
    });
};
