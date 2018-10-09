/* Main Application Object */
class Application {
    // constructor() {}

    public Initialize() {
        console.log('Application initializing...');

        $('.navigation li').on('click', (e: any) => {
            console.log(e);
        });
    }
}

// Our singleton application instance
const app = new Application();

$(() => {
    // When the DOM is ready, bootstrap application
    app.Initialize();
});
