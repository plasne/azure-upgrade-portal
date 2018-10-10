"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ui_binding_1 = require("./ui-binding");
/* Main Application Object */
class Application {
    constructor(ui) {
        this.ui = ui;
    }
    Initialize() {
        console.log('Application initializing...');
        this.ui.SetupNavigationEvents();
        this.ui.SelectDefaultNavigationItem();
        console.log('Initialization complete.');
    }
}
// Our singleton application instance
const app = new Application(new ui_binding_1.UIBinding());
$(() => {
    // When the DOM is ready, bootstrap application
    app.Initialize();
});
