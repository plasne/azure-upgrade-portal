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
