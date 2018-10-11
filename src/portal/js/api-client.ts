// Client shim for API calls to get/set data.
export interface IApiClient {
    LoadOverviewData(): Promise<IOverviewSummary>;
    LoadNeededRemediations(): Promise<IRemediationNeeded>;
    LoadCompletedRemediations(): Promise<IRemediationCompleted>;
}

// Defines return structure for the overview/landing page.
export interface IOverviewSummary {
    LastRefreshed: Date;
    RemediationsCompleted: number;
    RemediationsPending: number;
}

// Defines a system that requires upgranding, including the reason / etc.
export interface IUpgradableSystem {
    Name: string;
    Type: string;
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
                Name: 'VM01',
                Type: 'Virtual Machine'
            });

            storageUpgradable.push({
                Name: 'VM05',
                Type: 'Virtual Machine'
            });

            storageUpgradable.push({
                Name: 'VM13',
                Type: 'Virtual Machine'
            });

            storageUpgradable.push({
                Name: 'ABC-123',
                Type: 'Virtual Machine'
            });

            computeUpgradable.push({
                Name: 'VM-Z23',
                Type: 'Virtual Machine'
            });

            computeUpgradable.push({
                Name: 'CS-TR344',
                Type: 'Cloud Service'
            });

            computeUpgradable.push({
                Name: 'CS-T23323',
                Type: 'Cloud Service'
            });

            computeUpgradable.push({
                Name: 'CS-AB34534',
                Type: 'Cloud Service'
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
                Name: 'VM05',
                Type: 'Virtual Machine'
            });

            computeUpgraded.push({
                Name: 'VM75',
                Type: 'Virtual Machine'
            });

            computeUpgraded.push({
                Name: 'VM99',
                Type: 'Virtual Machine'
            });

            storageUpgraded.push({
                Name: 'VM05-x',
                Type: 'Virtual Machine'
            });

            storageUpgraded.push({
                Name: 'VM425-Z',
                Type: 'Virtual Machine'
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
}
