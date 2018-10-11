(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    LoadCompletedRemediations() {
        return new Promise(resolve => {
            const computeUpgraded = [];
            const storageUpgraded = [];
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
    LoadScheduledJobs() {
        return new Promise(resolve => {
            const mockResponse = {
                JobList: []
            };
            const jobList = [];
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

},{}],2:[function(require,module,exports){
(function (global){
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core application controller that handles top-level orchestration
const api = __importStar(require("./api-client"));
const ui_binding_1 = require("./ui-binding");
// Main Application Object
class Application {
    constructor(ui) {
        this.ui = ui;
        this.apiClient = new api.ApiClient();
    }
    // Initialize the applicaiton hooks
    Initialize() {
        console.log('Application initializing...');
        this.ui.SetGlobalCallbacks();
        this.ui.SetDetailsLinkCallback((id) => {
            this.LoadDetailsView(id);
        });
        this.ui.SetNavigationCallback((path) => {
            console.log(`Location hash changed: ${path}`);
        });
        this.ui.SetupNavigationEvents((title) => {
            console.log(`Navigation selected: ${title}`);
            this.LookupAndSetContentTitle(title);
            this.ui.SetNavigationFragment(title);
        });
        this.ui.SelectDefaultNavigationItem();
        this.ui.SetBusyState(false);
        console.log('Initialization complete.');
    }
    // Depending on the current route path, set the appropriate
    // content stage path (and fire off the content loading)
    LookupAndSetContentTitle(selectedTitle) {
        let title = selectedTitle;
        this.ui.ClearContentStage();
        switch (selectedTitle) {
            case 'overview':
                title = 'Overview';
                this.LoadOverviewContent();
                break;
            case 'remediation-needed':
                title = 'Remediations Needed';
                this.LoadRemediationNeededContent();
                break;
            case 'remediation-complete':
                title = 'Remediations Complete';
                this.LoadRemediationsCompletedContent();
                break;
            case 'scheduled-jobs':
                title = 'Scheduled Jobs';
                this.LoadScheduledJobsContent();
                break;
            case 'logs':
                title = 'Logs';
                break;
            case 'settings':
                title = 'Settings';
                break;
        }
        this.ui.SetContentStageTitle(title);
    }
    // Loads the details data for the given remediation id (i.e., name, etc....TBD)
    async LoadDetailsView(id) {
        this.ui.SetBusyState(true);
        const details = await this.apiClient.LoadDetailsData(id);
        this.ui.RenderDetailsView(details);
        this.ui.SetBusyState(false);
    }
    // Loads the overview content, and handles the UI state orchestration
    async LoadOverviewContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadOverviewData();
        this.ui.RenderOverviewContent(data);
        this.ui.SetBusyState(false);
    }
    // Loads the remediation needed content, and handles the UI state orchestration
    async LoadRemediationNeededContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadNeededRemediations();
        this.ui.RenderRemediationNeededContent(data);
        this.ui.SetBusyState(false);
    }
    // Loads the remediation complete content, and handles the UI state orchestration
    async LoadRemediationsCompletedContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadCompletedRemediations();
        this.ui.RenderRemediationCompletedContent(data);
        this.ui.SetBusyState(false);
    }
    async LoadScheduledJobsContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadScheduledJobs();
        this.ui.RenderScheduledJobsContent(data);
        this.ui.SetBusyState(false);
    }
}
exports.Application = Application;
// Detech if we're running in a test
const isInTest = typeof global.it === 'function';
if (!isInTest) {
    // Our singleton application instance
    const app = new Application(new ui_binding_1.UIBinding());
    $(() => {
        app.Initialize();
    });
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api-client":1,"./ui-binding":3}],3:[function(require,module,exports){
"use strict";
// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.
Object.defineProperty(exports, "__esModule", { value: true });
class UIBinding {
    SetGlobalCallbacks() {
        $(document).on('click', 'button.dialogClose', (e) => {
            console.log('Dialog close button clicked');
            $(e.target)
                .parents('.dialog-stage')
                .hide();
        });
    }
    SetDetailsLinkCallback(onDetailsClick) {
        $(document).on('click', 'a.detailsViewLink', (e) => {
            // Notify app controller
            onDetailsClick($(e.target).data('item-name'));
        });
    }
    SetBusyState(busy) {
        if (busy) {
            $('.loadingSpinner').css('display', 'block');
        }
        else {
            $('.loadingSpinner').css('display', 'none');
        }
    }
    SetNavigationCallback(onNavigation) {
        // This method can be used to wire up any initial event handlers
        $(window).on('hashchange', () => {
            const navTitle = location.hash.replace('#', '');
            onNavigation(navTitle);
            $(`.navigation li[data-action-name="${navTitle}"]`).click();
        });
    }
    SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }
    SetupNavigationEvents(onTitleSelected) {
        $('.navigation li').on('click', (e) => {
            const contentTitle = $(e.target).data('action-name');
            if (onTitleSelected) {
                onTitleSelected(contentTitle);
            }
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }
    SetContentStageTitle(title) {
        $('.content-stage h2').text(title);
    }
    SetNavigationFragment(path) {
        location.hash = path;
    }
    ClearContentStage() {
        $('.content-stage .placeholder').html('');
    }
    RenderOverviewContent(data) {
        const markup = `
            <ul class="overview listNone">
                <li class="pending">Remediations Pending: <span>${data.RemediationsPending}</span></li>
                <li class="completed">Remediations Completed: <span>${data.RemediationsCompleted}</span></li>
                <li class="lastUpdated"><em>Last updated on ${data.LastRefreshed.toLocaleDateString()} at
                    ${data.LastRefreshed.toLocaleTimeString()}</em></li>
            </ul>
            <h3>Next Steps</h3>
            <p>To schedule a new remediation scan, click the button below:</p>
            <button>Schedule Scan<i class="fas fa-arrow-right"></i></button>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderRemediationNeededContent(data) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems are found to need compute upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsComputeUpgrade.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Group +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                item.UpgradeDescription +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems are found to need storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsStorageUpgrade.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Group +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                item.UpgradeDescription +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderRemediationCompletedContent(data) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems have completed compute ugprades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadComputeUpgraded.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Group +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems have completed storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadStorageUpgraded.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Group +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderScheduledJobsContent(data) {
        const markup = `
            <div class="dataRegion">
                <p><i class="far fa-clock"></i>Current scheduled job status:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>Job Type</td>
                        <td>Status</td>
                        <td>Duration</td>
                        <td>Last Update</td>
                    </tr>
                ${data.JobList.map(item => {
            return ('<tr><td>' +
                item.JobType +
                '</td><td>' +
                item.Status +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td>' +
                item.LastUpdate.toLocaleDateString() +
                ' ' +
                item.LastUpdate.toLocaleTimeString() +
                '</td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderDetailsView(data) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name}</li>
                <li><strong>Duration:</strong> ${data.Type} (${this.formatDurationInMs(data.DurationInMs)})</li>
            </ul>
            <textarea>${data.UpgradeDescription}</textarea>
        `;
        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }
    formatDurationInMs(durationInMs) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }
}
exports.UIBinding = UIBinding;

},{}]},{},[1,2,3]);
