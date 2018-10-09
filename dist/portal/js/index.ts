/* Main Application Object */
class Application {
    // constructor() {}

    public Initialize() {
        console.log('Application initializing...');

        $('.navigation li').on('click', () => {
            console.log('Navigation item selected');
        });
    }
}

const app = new Application();

$(() => {
    app.Initialize();
});
