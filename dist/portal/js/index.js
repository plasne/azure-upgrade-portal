"use strict";
/* Main Application Object */
class Application {
    // constructor() {}
    Initialize() {
        console.log('Application initializing...');
        $('.navigation li').on('click', (e) => {
            // For now, dump the navigation data value to the content stage
            // TODO: Call into different components
            const sampleContent = `{${$(e.target).data('action-name')}}`;
            $('.content-stage h2').text(sampleContent);
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
        // Select default navigation item
        $('.navigation li.selected').click();
    }
}
// Our singleton application instance
const app = new Application();
$(() => {
    // When the DOM is ready, bootstrap application
    app.Initialize();
});
