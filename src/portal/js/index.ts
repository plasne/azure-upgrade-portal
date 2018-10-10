import { IUIBinding, UIBinding } from './ui-binding';

/* Main Application Object */
class Application {
    private ui: UIBinding;

    constructor(ui: IUIBinding) {
        this.ui = ui;
    }

    public Initialize() {
        console.log('Application initializing...');
        this.ui.SetupNavigationEvents();
        this.ui.SelectDefaultNavigationItem();
        // this.ui.DisplaySummaryInformation();
        console.log('Initialization complete.');
    }
}

// Our singleton application instance
const app = new Application(new UIBinding());

$(() => {
    app.Initialize();
});
