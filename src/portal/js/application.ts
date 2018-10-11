// Core application controller that handles top-level orchestration
import * as api from './api-client';
import { IUIBinding, UIBinding } from './ui-binding';

// Main Application Object
export class Application {
    private ui: UIBinding;
    private apiClient: api.ApiClient;

    constructor(ui: IUIBinding) {
        this.ui = ui;
        this.apiClient = new api.ApiClient();
    }

    // Initialize the applicaiton hooks
    public Initialize() {
        console.log('Application initializing...');
        this.ui.InitializeEventHooks();

        this.ui.SetNavigationCallback((path: string) => {
            console.log(`Location hash changed: ${path}`);
        });

        this.ui.SetupNavigationEvents((title: string) => {
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
    public LookupAndSetContentTitle(selectedTitle: string) {
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

    // Loads the overview content, and handles the UI state orchestration
    public async LoadOverviewContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadOverviewData();
        this.ui.RenderOverviewContent(data);
        this.ui.SetBusyState(false);
    }

    // Loads the remediation needed content, and handles the UI state orchestration
    public async LoadRemediationNeededContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadNeededRemediations();
        this.ui.RenderRemediationNeededContent(data);
        this.ui.SetBusyState(false);
    }

    // Loads the remediation complete content, and handles the UI state orchestration
    public async LoadRemediationsCompletedContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadCompletedRemediations();
        this.ui.RenderRemediationCompletedContent(data);
        this.ui.SetBusyState(false);
    }
}

// Detech if we're running in a test
const isInTest = typeof global.it === 'function';
if (!isInTest) {
    // Our singleton application instance
    const app = new Application(new UIBinding());

    $(() => {
        app.Initialize();
    });
}
