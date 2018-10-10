(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
exports.ApiClient = ApiClient;

},{}],2:[function(require,module,exports){
(function (global){
"use strict";
// Core application controller that handles top-level orchestration
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = __importStar(require("./api-client"));
const ui_binding_1 = require("./ui-binding");
/* Main Application Object */
class Application {
    constructor(ui) {
        this.ui = ui;
        this.apiClient = new api.ApiClient();
    }
    Initialize() {
        console.log('Application initializing...');
        this.ui.SetBusyState(false);
        this.ui.SetNavigationCallback((path) => {
            console.log(`Location hash changed: ${path}`);
        });
        this.ui.SetupNavigationEvents((title) => {
            console.log(`Navigation selected: ${title}`);
            this.LookupAndSetContentTitle(title);
            this.ui.SetNavigationFragment(title);
        });
        this.ui.SelectDefaultNavigationItem();
        console.log('Initialization complete.');
    }
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
                break;
            case 'scheduled-jobs':
                title = 'Scheduled Jobs';
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
    async LoadOverviewContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadOverviewData();
        this.ui.RenderOverviewContent(data);
        this.ui.SetBusyState(false);
    }
    async LoadRemediationNeededContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadNeededRemediations();
        this.ui.RenderRemediationNeededContent(data);
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
            <ul class="overview">
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
            <div class="computeUpgradable">
                <i class="fas fa-server"></i>
                <p>The following systems are found to need compute upgrades:</p>
                <table>
                    <colgroup>
                        <col width="10%" />
                        <col width="90%" />
                    </colgroup>
                ${data.NeedsComputeUpgrade.map(item => {
            return ('<tr><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                ')</td></tr>');
        }).join('')}
                </table>
            </div>
            <hr class="thinRule" />
            <div class="storageUpgradable">
                <i class="far fa-hdd"></i>
                <p>The following systems are found to need storage account upgrades:</p>
                <table>
                    <colgroup>
                        <col width="10%" />
                        <col width="90%" />
                    </colgroup>
                ${data.NeedsStorageUpgrade.map(item => {
            return ('<tr><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                ')</td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
}
exports.UIBinding = UIBinding;

},{}]},{},[1,2,3]);
