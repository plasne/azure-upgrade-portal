"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JobStatus;
(function (JobStatus) {
    JobStatus["Pending"] = "Pending";
    JobStatus["Running"] = "Running";
    JobStatus["Complete"] = "Complete";
    JobStatus["Failed"] = "Failed";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
// Implements our ApiClient functionality
class ApiClient {
    // Loads data for the overview / landing page.
    // This data isn't updated directly; instead, it is reflective of last run
    // information.
    LoadOverviewData() {
        return new Promise(resolve => {
            const mockResponse = {
                LastRefreshed: new Date(),
                RemediationsCompleted: 7,
                RemediationsPending: 2
            };
            // TODO: This should be an API call, but for now simulate slow calls.
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
    // Loads data for the machines that currently need remediation applied.
    // Note this may return other resources beyond machines, but we'll stop there for now.
    LoadNeededRemediations() {
        return new Promise(resolve => {
            const storageUpgradable = [];
            const computeUpgradable = [];
            storageUpgradable.push({
                DurationInMs: 0,
                Name: 'VM01',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });
            storageUpgradable.push({
                DurationInMs: 0,
                Name: 'VM05',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });
            storageUpgradable.push({
                DurationInMs: 0,
                Name: 'VM13',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });
            storageUpgradable.push({
                DurationInMs: 0,
                Name: 'ABC-123',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });
            computeUpgradable.push({
                DurationInMs: 0,
                Name: 'VM-Z23',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgrade required'
            });
            computeUpgradable.push({
                DurationInMs: 0,
                Name: 'CS-TR344',
                Type: 'Cloud Service',
                UpgradeDescription: 'VM series upgrade required'
            });
            computeUpgradable.push({
                DurationInMs: 0,
                Name: 'CS-T23323',
                Type: 'Cloud Service',
                UpgradeDescription: 'VM series upgrade required'
            });
            computeUpgradable.push({
                DurationInMs: 0,
                Name: 'CS-AB34534',
                Type: 'Cloud Service',
                UpgradeDescription: 'VM series upgrade required'
            });
            const mockResponse = {
                NeedsComputeUpgrade: computeUpgradable,
                NeedsStorageUpgrade: storageUpgradable
            };
            // TODO: This will be a real API call, bur for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
    LoadCompletedRemediations() {
        return new Promise(resolve => {
            const computeUpgraded = [];
            const storageUpgraded = [];
            computeUpgraded.push({
                DurationInMs: 5 * 60 * 1000,
                Name: 'VM05',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            computeUpgraded.push({
                DurationInMs: 15 * 60 * 1000,
                Name: 'VM75',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            computeUpgraded.push({
                DurationInMs: 4 * 60 * 1000,
                Name: 'VM99',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            storageUpgraded.push({
                DurationInMs: 45 * 60 * 1000,
                Name: 'VM05-x',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage account upgraded'
            });
            storageUpgraded.push({
                DurationInMs: 56.2 * 60 * 1000,
                Name: 'VM425-Z',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage account upgraded'
            });
            const mockResponse = {
                HadComputeUpgraded: computeUpgraded,
                HadStorageUpgraded: storageUpgraded
            };
            // TODO: this will be a real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
    LoadScheduledJobs() {
        return new Promise(resolve => {
            const mockResponse = {
                JobList: []
            };
            const jobList = [];
            jobList.push({
                DurationInMs: 3 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 1',
                Status: JobStatus.Pending
            });
            jobList.push({
                DurationInMs: 6 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 2',
                Status: JobStatus.Running
            });
            jobList.push({
                DurationInMs: 12.4 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 3',
                Status: JobStatus.Running
            });
            jobList.push({
                DurationInMs: 7 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 4',
                Status: JobStatus.Pending
            });
            jobList.push({
                DurationInMs: 32 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 5',
                Status: JobStatus.Complete
            });
            jobList.push({
                DurationInMs: 43.1 * 60 * 1000,
                LastUpdate: new Date(),
                Name: 'Sample Job 6',
                Status: JobStatus.Failed
            });
            mockResponse.JobList = jobList;
            // TODO: This will be real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
    LoadDetailsData(id) {
        return new Promise(resolve => {
            const mockResponse = {
                DurationInMs: 15 * 60 * 1000,
                Name: id,
                Type: 'Virtual Machine Upgrade',
                UpgradeDescription: 'This was a sample operation that involved the following upgrade steps:\n\n' +
                    'Step 1: Do the foo\nStep 2: Read the bar\nStep 3: ???\nStep 4: Profit!!!'
            };
            // TODO: This will be a real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
}
exports.ApiClient = ApiClient;
