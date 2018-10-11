// Core application controller that handles top-level orchestration

import * as api from './api-client';
import { IUIBinding, UIBinding } from './ui-binding';

/* Main Application Object */
export class Application {
    private ui: UIBinding;
    private apiClient: api.ApiClient;

    constructor(ui: IUIBinding) {
        this.ui = ui;
        this.apiClient = new api.ApiClient();
    }

    public Initialize() {
        console.log('Application initializing...');
        this.ui.SetBusyState(false);

        this.ui.SetNavigationCallback((path: string) => {
            console.log(`Location hash changed: ${path}`);
        });

        this.ui.SetupNavigationEvents((title: string) => {
            console.log(`Navigation selected: ${title}`);
            this.LookupAndSetContentTitle(title);
            this.ui.SetNavigationFragment(title);
        });

        this.ui.SelectDefaultNavigationItem();
        console.log('Initialization complete.');
    }

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

    public async LoadOverviewContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadOverviewData();
        this.ui.RenderOverviewContent(data);
        this.ui.SetBusyState(false);
    }

    public async LoadRemediationNeededContent() {
        this.ui.SetBusyState(true);
        const data = await this.apiClient.LoadNeededRemediations();
        this.ui.RenderRemediationNeededContent(data);
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
