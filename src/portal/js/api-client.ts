// Client shim for API calls to get/set data.
export interface IApiClient {
    LoadOverviewData(): Promise<IOverviewSummary>;
    LoadNeededRemediations(): Promise<IRemediationNeeded>;
    LoadCompletedRemediations(): Promise<IRemediationCompleted>;
    LoadScheduledJobs(): Promise<IScheduledJobs>;
    LoadDetailsData(id: string): Promise<IDetailsData>;
}

// Defines return structure for the overview/landing page.
export interface IOverviewSummary {
    LastRefreshed: Date;
    RemediationsCompleted: number;
    RemediationsPending: number;
}

// Defines a system that requires upgranding, including the reason / etc.
export interface IUpgradableSystem {
    DurationInMs: number;
    Group: string;
    Name: string;
    Type: string;
    UpgradeDescription: string;
}

// Defines return structure for systems that require upgrades
export interface IRemediationNeeded {
    NeedsStorageUpgrade: IUpgradableSystem[];
    NeedsComputeUpgrade: IUpgradableSystem[];
}

// Defines return structure for systems that have completed upgrades
export interface IRemediationCompleted {
    HadComputeUpgraded: IUpgradableSystem[];
    HadStorageUpgraded: IUpgradableSystem[];
}

export enum JobStatus {
    Pending = 'Pending',
    Running = 'Running',
    Complete = 'Complete',
    Failed = 'Failed'
}

export interface IJobDetails {
    DurationInMs: number;
    JobType: string;
    Status: JobStatus;
    LastUpdate: Date;
}

export interface IScheduledJobs {
    JobList: IJobDetails[];
}

export interface IDetailsData {
    DurationInMs: number;
    Name: string;
    Type: string;
    UpgradeDescription: string;
}

// Implements our ApiClient functionality
export class ApiClient implements IApiClient {
    // Loads data for the overview / landing page.
    // This data isn't updated directly; instead, it is reflective of last run
    // information.
    public LoadOverviewData() {
        return new Promise<IOverviewSummary>(resolve => {
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
    public LoadNeededRemediations() {
        return new Promise<IRemediationNeeded>(resolve => {
            const storageUpgradable: IUpgradableSystem[] = [];
            const computeUpgradable: IUpgradableSystem[] = [];

            storageUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'VM01',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });

            storageUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'VM05',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });

            storageUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'VM13',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });

            storageUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'ABC-123',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage upgrade required'
            });

            computeUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'VM-Z23',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgrade required'
            });

            computeUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'CS-TR344',
                Type: 'Cloud Service',
                UpgradeDescription: 'VM series upgrade required'
            });

            computeUpgradable.push({
                DurationInMs: 0,
                Group: '',
                Name: 'CS-T23323',
                Type: 'Cloud Service',
                UpgradeDescription: 'VM series upgrade required'
            });

            computeUpgradable.push({
                DurationInMs: 0,
                Group: '',
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

    public LoadCompletedRemediations() {
        return new Promise<IRemediationCompleted>(resolve => {
            const computeUpgraded: IUpgradableSystem[] = [];
            const storageUpgraded: IUpgradableSystem[] = [];

            computeUpgraded.push({
                DurationInMs: 5 * 60 * 1000,
                Group: '',
                Name: 'VM05',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });

            computeUpgraded.push({
                DurationInMs: 15 * 60 * 1000,
                Group: '',
                Name: 'VM75',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });

            computeUpgraded.push({
                DurationInMs: 4 * 60 * 1000,
                Group: '',
                Name: 'VM99',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });

            storageUpgraded.push({
                DurationInMs: 45 * 60 * 1000,
                Group: '',
                Name: 'VM05-x',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage account upgraded'
            });

            storageUpgraded.push({
                DurationInMs: 56.2 * 60 * 1000,
                Group: '',
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

    public LoadScheduledJobs() {
        return new Promise<IScheduledJobs>(resolve => {
            const mockResponse: IScheduledJobs = {
                JobList: []
            };
            const jobList: IJobDetails[] = [];

            jobList.push({
                DurationInMs: 3 * 60 * 1000,
                JobType: 'Remediation Scan',
                LastUpdate: new Date(),
                Status: JobStatus.Pending
            });

            jobList.push({
                DurationInMs: 6 * 60 * 1000,
                JobType: 'Remediation Scan',
                LastUpdate: new Date(),
                Status: JobStatus.Running
            });

            jobList.push({
                DurationInMs: 12.4 * 60 * 1000,
                JobType: 'VM Upgrade',
                LastUpdate: new Date(),
                Status: JobStatus.Running
            });

            jobList.push({
                DurationInMs: 7 * 60 * 1000,
                JobType: 'VM Upgrade',
                LastUpdate: new Date(),
                Status: JobStatus.Pending
            });

            jobList.push({
                DurationInMs: 32 * 60 * 1000,
                JobType: 'Storage Migration',
                LastUpdate: new Date(),
                Status: JobStatus.Complete
            });

            jobList.push({
                DurationInMs: 43.1 * 60 * 1000,
                JobType: 'Storage Migration',
                LastUpdate: new Date(),
                Status: JobStatus.Failed
            });

            mockResponse.JobList = jobList;

            // TODO: This will be real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }

    public LoadDetailsData(id: string) {
        return new Promise<IDetailsData>(resolve => {
            const mockResponse: IDetailsData = {
                DurationInMs: 15 * 60 * 1000,
                Name: id,
                Type: 'Virtual Machine Upgrade',
                UpgradeDescription:
                    'This was a sample operation that involved the following upgrade steps:\n\n' +
                    'Step 1: Do the foo\nStep 2: Read the bar\nStep 3: ???\nStep 4: Profit!!!'
            };
            // TODO: This will be a real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, 1000);
        });
    }
}
