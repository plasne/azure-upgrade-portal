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
    // Loads data for the machines that currently need remediation applied.
    // Note this may return other resources beyond machines, but we'll stop there for now.
    LoadNeededRemediations() {
        return new Promise(resolve => {
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
}
exports.ApiClient = ApiClient;
