"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const assert = require("assert");
require("mocha");
const Application = require("./js/application.js");
// This is a mock implementation of the UI layer which lets of invoke and inspect calls.
class TestUIBinding {
    constructor() {
        this.DefaultNavigationItemCalled = false;
        this.ContentStageTitle = '';
        this.TitleSelectionCallback = (title) => {
            console.log(`TitleSelectionCallback defeault implementation: ${title}`);
        };
    }
    SetBusyState(busy) {
        console.log(`Setting busy state to: ${busy}`);
    }
    SetNavigationCallback(onNavigation) {
        onNavigation('test');
    }
    SetupNavigationEvents(onTitleSelected) {
        this.TitleSelectionCallback = onTitleSelected;
    }
    SelectDefaultNavigationItem() {
        this.DefaultNavigationItemCalled = true;
    }
    SetContentStageTitle(title) {
        this.ContentStageTitle = title;
    }
    SetNavigationFragment(path) {
        console.log(`New navigation fragment is: ${path}`);
    }
    ClearContentStage() {
        console.log('Cleared content stage.');
    }
    RenderOverviewContent(data) {
        console.log(`Overview data loaded: ${JSON.stringify(data)}`);
    }
    RenderRemediationNeededContent(data) {
        console.log(`Remediation needed data loaded: ${JSON.stringify(data)}`);
    }
    ClickNavigationItem(itemName) {
        this.TitleSelectionCallback(itemName);
    }
}
describe('Application controller unit tests', () => {
    it('Should pre-select the default nav item on initilization.', () => {
        const testUI = new TestUIBinding();
        const app = new Application.Application(testUI);
        app.Initialize();
        assert.equal(testUI.DefaultNavigationItemCalled, true);
    });
    it('Should set the content title corresponding to the nav item.', () => {
        const testUI = new TestUIBinding();
        const app = new Application.Application(testUI);
        app.Initialize();
        testUI.ClickNavigationItem('remediation-needed');
        assert.equal(testUI.ContentStageTitle, 'Remediations Needed');
        testUI.ClickNavigationItem('remediation-complete');
        assert.equal(testUI.ContentStageTitle, 'Remediations Complete');
        testUI.ClickNavigationItem('settings');
        assert.equal(testUI.ContentStageTitle, 'Settings');
        testUI.ClickNavigationItem('logs');
        assert.equal(testUI.ContentStageTitle, 'Logs');
        testUI.ClickNavigationItem('overview');
        assert.equal(testUI.ContentStageTitle, 'Overview');
    });
});
