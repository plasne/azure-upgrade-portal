(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("uuid");
const uuid = require("uuid");
// Defines the status that the job is in
var JobStatus;
(function (JobStatus) {
    JobStatus["Pending"] = "Pending";
    JobStatus["Running"] = "Running";
    JobStatus["Complete"] = "Complete";
    JobStatus["Failed"] = "Failed";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
// Implements our ApiClient functionality
class ApiClient {
    constructor() {
        this.mockSleepInterval = 500;
    }
    // Loads data for the overview / landing page.
    // This data isn't updated directly; instead, it is reflective of last run
    // information.
    LoadOverviewData() {
        return new Promise(resolve => {
            const mockResponse = {
                LastRefreshed: new Date(),
                RemediationsCompleted: 7,
                RemediationsFailed: 3,
                RemediationsPending: 2,
                SuccessPercentage: 7 / (7 + 3)
            };
            // TODO: This should be an API call, but for now simulate slow calls.
            setTimeout(() => {
                resolve(mockResponse);
            }, this.mockSleepInterval);
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
            }, this.mockSleepInterval);
        });
    }
    LoadCompletedRemediations() {
        return new Promise(resolve => {
            const computeUpgraded = [];
            const storageUpgraded = [];
            computeUpgraded.push({
                DurationInMs: 5 * 60 * 1000,
                Group: 'CRM Dev',
                Name: 'VM05',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            computeUpgraded.push({
                DurationInMs: 15 * 60 * 1000,
                Group: 'CRM Dev',
                Name: 'VM75',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            computeUpgraded.push({
                DurationInMs: 4 * 60 * 1000,
                Group: 'CRM Prod',
                Name: 'VM99',
                Type: 'Virtual Machine',
                UpgradeDescription: 'VM series upgraded'
            });
            storageUpgraded.push({
                DurationInMs: 45 * 60 * 1000,
                Group: 'CRM Prod',
                Name: 'VM05-x',
                Type: 'Virtual Machine',
                UpgradeDescription: 'Storage account upgraded'
            });
            storageUpgraded.push({
                DurationInMs: 56.2 * 60 * 1000,
                Group: 'Sandbox',
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
            }, this.mockSleepInterval);
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
                JobId: uuid(),
                JobType: 'Remediation Scan',
                LastUpdate: new Date(),
                Status: JobStatus.Pending
            });
            jobList.push({
                DurationInMs: 6 * 60 * 1000,
                JobId: uuid(),
                JobType: 'Remediation Scan',
                LastUpdate: new Date(),
                Status: JobStatus.Running
            });
            jobList.push({
                DurationInMs: 12.4 * 60 * 1000,
                JobId: uuid(),
                JobType: 'VM Upgrade',
                LastUpdate: new Date(),
                Status: JobStatus.Running
            });
            jobList.push({
                DurationInMs: 7 * 60 * 1000,
                JobId: uuid(),
                JobType: 'VM Upgrade',
                LastUpdate: new Date(),
                Status: JobStatus.Pending
            });
            jobList.push({
                DurationInMs: 32 * 60 * 1000,
                JobId: uuid(),
                JobType: 'Storage Migration',
                LastUpdate: new Date(),
                Status: JobStatus.Complete
            });
            jobList.push({
                DurationInMs: 43.1 * 60 * 1000,
                JobId: uuid(),
                JobType: 'Storage Migration',
                LastUpdate: new Date(),
                Status: JobStatus.Failed
            });
            mockResponse.JobList = jobList;
            // TODO: This will be real API call, but for now simulate delays
            setTimeout(() => {
                resolve(mockResponse);
            }, this.mockSleepInterval);
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
            }, this.mockSleepInterval);
        });
    }
}
exports.ApiClient = ApiClient;

},{"uuid":4}],2:[function(require,module,exports){
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
        this.ui.SetGlobalCallbacks(() => {
            console.log('Dialog was closed!!');
        }, () => {
            console.log('Content fresh selected!!');
        });
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
    SetGlobalCallbacks(onDialogClose, onRefreshContent) {
        // Handle closing of dialogs, and let app know
        $(document).on('click', 'button.dialogClose', (e) => {
            $(e.target)
                .parents('.dialog-stage')
                .hide();
            if (onDialogClose) {
                onDialogClose();
            }
        });
        // Handle any clicks from 'Refresh' toolbar items.
        $(document).on('click', '.dataGridToolbar .refreshContent', () => {
            if (onRefreshContent) {
                onRefreshContent();
            }
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
            <div class="overview successChart">
                <div class="failedBar">
                    <div class="successBar" style="width: ${data.SuccessPercentage *
            100}%">
                        <p>Success rate: ${data.SuccessPercentage * 100}%</p>
                    </div>
                </div>
            </div>

            <ul class="overview listNone">
                <li class="pending">Remediations Pending: <span>${data.RemediationsPending}</span></li>
                <li class="completed">Remediations Completed: <span>${data.RemediationsCompleted}</span></li>
                <li class="failed">Remediations Failed: <span>${data.RemediationsFailed}</span></li>
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
                <p>The following systems are found to need compute upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group Selected</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup Selected</li>
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationNeededRows(data)}
                </table>
            </div>
            <div class="dataRegion">
                <p>The following systems are found to need storage account upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group Selected</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup Selected</li>
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationNeededRows(data)}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderRemediationCompletedContent(data) {
        const markup = `
            <div class="dataRegion">
                <p></i>The following systems have completed compute ugprades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationCompletedRows(data)}
                </table>
            </div>
            <div class="dataRegion">
                <p>The following systems have completed storage account upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationCompletedRows(data)}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderScheduledJobsContent(data) {
        const markup = `
            <div class="dataRegion">
                <p></i>Current scheduled job status:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Job Type</td>
                        <td>Status</td>
                        <td>Duration</td>
                        <td>Job Log</td>
                        <td>Last Update</td>
                    </tr>
                    ${this.renderScheduledJobsRows(data)}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderDetailsView(data) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name} (${data.Type})</li>
                <li><strong>Duration:</strong> ${this.formatDurationInMs(data.DurationInMs)}</li>
            </ul>
            <textarea readonly>${data.UpgradeDescription}</textarea>
        `;
        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }
    formatDurationInMs(durationInMs) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }
    renderRemediationNeededRows(data) {
        return data.NeedsComputeUpgrade.map(item => {
            return `
            <tr>
                <td><input type="checkbox" /></td>
                <td>${item.Name}</td>
                <td>${item.Group}</td>
                <td>${item.Type}</td>
                <td>${item.UpgradeDescription}</td>
                <td><a class="detailsViewLink" data-item-name="${item.Name}">Click to view...</a></td>
            </tr>
            `;
        }).join('');
    }
    renderRemediationCompletedRows(data) {
        return data.HadComputeUpgraded.map(item => {
            return `
            <tr>
                <td>${item.Name}</td>
                <td>${item.Group}</td>
                <td>${item.Type}</td>
                <td>${this.formatDurationInMs(item.DurationInMs)}</td>
                <td><a class="detailsViewLink" data-item-name="${item.Name}">Click to view...</a></td>
            </tr>
            `;
        }).join('');
    }
    renderScheduledJobsRows(data) {
        return data.JobList.map(item => {
            return `
            <tr>
                <td>${item.JobType}</td>
                <td>${item.Status}</td>
                <td>${this.formatDurationInMs(item.DurationInMs)}</td>
                <td><a class="detailsViewLink" data-item-name="${item.JobId}">View Log...</a></td>
                <td>${item.LastUpdate.toLocaleDateString()} ${item.LastUpdate.toLocaleTimeString()}</td>
            </tr>
            `;
        }).join('');
    }
}
exports.UIBinding = UIBinding;

},{}],4:[function(require,module,exports){
var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":7,"./v4":8}],5:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],6:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],7:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":5,"./lib/rng":6}],8:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":5,"./lib/rng":6}]},{},[1,2,3]);
