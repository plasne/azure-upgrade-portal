/* Main Application Object */
class Application {
    // constructor() {}

    public Initialize() {
        console.log('Application initializing...');
    }
}

const app = new Application();

document.addEventListener('DOMContentLoaded', () => {
    app.Initialize();
});
