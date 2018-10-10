// includes
import assert = require('assert');
import 'mocha';
import * as api from './js/api-client';
import Application = require('./js/application.js');
import IUIBinding = require('./js/ui-binding.js');

// This is a mock implementation of the UI layer which lets of invoke and inspect calls.
class TestUIBinding implements IUIBinding.IUIBinding {
    public DefaultNavigationItemCalled: boolean = false;
    public ContentStageTitle: string = '';
    public TitleSelectionCallback: (title: string) => void;

    constructor() {
        this.TitleSelectionCallback = (title: string) => {
            console.log(
                `TitleSelectionCallback defeault implementation: ${title}`
            );
        };
    }

    public SetBusyState(busy: boolean) {
        console.log(`Setting busy state to: ${busy}`);
    }

    public SetNavigationCallback(onNavigation: (path: string) => void) {
        onNavigation('test');
    }

    public SetupNavigationEvents(onTitleSelected: (title: string) => void) {
        this.TitleSelectionCallback = onTitleSelected;
    }

    public SelectDefaultNavigationItem() {
        this.DefaultNavigationItemCalled = true;
    }

    public SetContentStageTitle(title: string) {
        this.ContentStageTitle = title;
    }

    public SetNavigationFragment(path: string) {
        console.log(`New navigation fragment is: ${path}`);
    }

    public ClearContentStage() {
        console.log('Cleared content stage.');
    }

    public RenderOverviewContent(data: api.IOverviewData) {
        console.log(`Overview data loaded: ${JSON.stringify(data)}`);
    }

    public ClickNavigationItem(itemName: string) {
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
