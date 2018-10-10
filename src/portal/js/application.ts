// Core application controller that handles top-level orchestration

import { IUIBinding, UIBinding } from './ui-binding';

/* Main Application Object */
class Application {
    private ui: UIBinding;

    constructor(ui: IUIBinding) {
        this.ui = ui;
    }

    public Initialize() {
        console.log('Application initializing...');
        this.ui.SetupNavigationEvents((title: string) => {
            this.LookupAndSetContentTitle(title);
            this.ui.SetNavigationFragment(title);
        });
        this.ui.SelectDefaultNavigationItem();
        // this.ui.DisplaySummaryInformation();
        console.log('Initialization complete.');
    }

    public LookupAndSetContentTitle(selectedTitle: string) {
        let title = selectedTitle;

        switch (selectedTitle) {
            case 'overview':
                title = 'Overview';
                break;
            case 'remediation-needed':
                title = 'Remediations Needed';
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
}

// Our singleton application instance
const app = new Application(new UIBinding());

$(() => {
    app.Initialize();
});
