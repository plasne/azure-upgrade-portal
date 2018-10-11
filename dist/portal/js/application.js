"use strict";
// Core application controller that handles top-level orchestration
Object.defineProperty(exports, "__esModule", { value: true });
const ui_binding_1 = require("./ui-binding");
/* Main Application Object */
class Application {
    constructor(ui) {
        this.ui = ui;
    }
    Initialize() {
        console.log('Application initializing...');
        this.ui.SetNavigationCallback((path) => {
            console.log(`Location hash changed: ${path}`);
        });
        this.ui.SetupNavigationEvents((title) => {
            console.log(`Navigation selected: ${title}`);
            this.LookupAndSetContentTitle(title);
            this.ui.SetNavigationFragment(title);
        });
        this.ui.SelectDefaultNavigationItem();
        // this.ui.DisplaySummaryInformation();
        console.log('Initialization complete.');
    }
    LookupAndSetContentTitle(selectedTitle) {
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
