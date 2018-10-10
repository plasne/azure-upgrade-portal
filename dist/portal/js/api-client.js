"use strict";
// Client shim for API calls to get/set data.
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.ApiClient = ApiClient;
