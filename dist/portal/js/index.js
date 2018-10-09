"use strict";
/* Main Application Object */
class Application {
    // constructor() {}
    Initialize() {
        console.log('Application initializing...');
    }
}
const app = new Application();
document.addEventListener('DOMContentLoaded', () => {
    app.Initialize();
});
