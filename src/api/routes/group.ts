import { Express } from 'express';
import Igroup from '../controllers/group';

module.exports = (app: Express) => {
    // a get specifying no route returns version
    app.get('/group', Igroup);
};
