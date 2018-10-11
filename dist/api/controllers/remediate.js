"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const azs = __importStar(require("azure-storage"));
const uuid_1 = require("uuid");
const Jobs_1 = __importDefault(require("../../jobs/Jobs"));
class RemediateTable {
    constructor() {
        this.name = 'remediation';
        this.svc = azs.createTableService(global.STORAGE_ACCOUNT, global.STORAGE_KEY);
    }
    static async Create(name) {
        const rt = new RemediateTable();
        rt.name = name;
        await rt.CreateIfNotExists();
        return rt;
    }
    async AddTask(record) {
        return new Promise((resolve, reject) => {
            try {
                const tr = this.createTask(record);
                this.svc.insertOrMergeEntity(this.name, tr, err => {
                    if (err)
                        throw err;
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    createTask(entity) {
        const result = {};
        Object.keys(entity).forEach(k => {
            const prop = Object.getOwnPropertyDescriptor(entity, k);
            if (prop) {
                result[k] = new azs.TableUtilities.entityGenerator.EntityProperty(prop.value);
            }
        });
        return result;
    }
    async CreateIfNotExists() {
        return new Promise((resolve, reject) => {
            try {
                this.svc.createTableIfNotExists(this.name, (err, result) => {
                    if (err)
                        throw err;
                    resolve(result);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.default = {
    /** Creates a remediation request */
    create: async (req, res, job) => {
        const body = req.body;
        try {
            const bwhen = body.when;
            const bscope = body.scope;
            const bopt = JSON.stringify(body.options);
            const table = 'remediate';
            // validate body contents
            if (!bwhen || !bscope) {
                global.logger.error('Incomplete JSON body: ' + req.body);
                res.status(400).end();
            }
            // generate a unique row key
            const id = uuid_1.v4();
            const storage = await RemediateTable.Create(table);
            await storage.AddTask({
                PartitionKey: 'remediate',
                RowKey: id,
                options: bopt,
                scope: bscope,
                when: bwhen
            });
            global.logger.info('Remediation record added');
            // send to job engine to queue to run
            const jobs = new Jobs_1.default(global.STORAGE_ACCOUNT, global.STORAGE_KEY);
            await jobs.createJob(job);
        }
        catch (error) {
            global.logger.error(error.stack);
            res.status(500).send('The remediation request could not be created. Please check the logs.');
        }
        res.send({
            success: true
        });
    }
};
