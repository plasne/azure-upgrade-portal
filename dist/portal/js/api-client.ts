// Client shim for API calls to get/set data.

export interface IApiClient {
    LoadOverviewData(): Promise<IOverviewSummary>;
    LoadNeededRemediations(): Promise<IRemediationNeeded>;
}

export interface IOverviewSummary {
    LastRefreshed: Date;
    RemediationsCompleted: number;
    RemediationsPending: number;
}

export interface IUpgradableSystem {
    Name: string;
    Type: string;
}

export interface IRemediationNeeded {
    NeedsStorageUpgrade: IUpgradableSystem[];
    NeedsComputeUpgrade: IUpgradableSystem[];
}

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
            const storageUpgradable = [];
            const computeUpgradable = [];

            storageUpgradable.push({
                Name: 'VM01',
                Type: 'Virtual Machine'
            });

            storageUpgradable.push({
                Name: 'VM05',
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
}
