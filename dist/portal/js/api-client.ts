// Client shim for API calls to get/set data.

export interface IApiClient {
    LoadOverviewData(): Promise<IOverviewData>;
}

export interface IOverviewData {
    LastRefreshed: Date;
    RemediationsCompleted: number;
    RemediationsPending: number;
}

export class ApiClient implements IApiClient {
    // Loads data for the overview / landing page.
    // This data isn't updated directly; instead, it is reflective of last run
    // information.
    public LoadOverviewData() {
        return new Promise<IOverviewData>(resolve => {
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
}
