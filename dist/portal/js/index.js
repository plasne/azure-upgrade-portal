"use strict";
/* Main Application Object */
class Application {
    // constructor() {}
    Initialize() {
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
