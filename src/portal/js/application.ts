// Core application controller that handles top-level orchestration

import { IUIBinding, UIBinding } from './ui-binding';

/* Main Application Object */
export class Application {
    private ui: UIBinding;

    constructor(ui: IUIBinding) {
        this.ui = ui;
    }

    public Initialize() {
        console.log('Application initializing...');

        this.ui.SetNavigationCallback((path: string) => {
            console.log(`Location hash changed: ${path}`);
        });

        this.ui.SetupNavigationEvents((title: string) => {
            console.log(`Navigation selected: ${title}`);
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

// Detech if we're running in a test
const isInTest = typeof global.it === 'function';
if (!isInTest) {
    // Our singleton application instance
    const app = new Application(new UIBinding());

    $(() => {
        app.Initialize();
    });
}
