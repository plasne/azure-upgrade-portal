"use strict";
/* Main Application Object */
class Application {
    // constructor() {}
    Initialize() {
        console.log('Application initializing...');
        this.setupNavigationHandlers();
        this.selectDefaultNavigationItem();
        console.log('Initialization complete.');
    }
    setupNavigationHandlers() {
        // For now, dump the navigation data value to the content stage
        // TODO: Call into different components
        $('.navigation li').on('click', (e) => {
            const sampleContent = `{${$(e.target).data('action-name')}}`;
            $('.content-stage h2').text(sampleContent);
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }
    selectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }
}
// Our singleton application instance
const app = new Application();
$(() => {
    // When the DOM is ready, bootstrap application
    app.Initialize();
});
