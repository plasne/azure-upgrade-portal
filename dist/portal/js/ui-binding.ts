// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.

import * as api from './api-client';

export interface IUIBinding {
    SetBusyState(busy: boolean): void;
    SetNavigationCallback(onNavigation: (path: string) => void): void;
    SetupNavigationEvents(onTitleSelected: (title: string) => void): void;
    SelectDefaultNavigationItem(): void;
    SetContentStageTitle(title: string): void;
    SetNavigationFragment(path: string): void;
    ClearContentStage(): void;
    RenderOverviewContent(data: api.IOverviewData): void;
}

export class UIBinding implements IUIBinding {
    public SetBusyState(busy: boolean) {
        if (busy) {
            $('.loadingSpinner').css('display', 'block');
        } else {
            $('.loadingSpinner').css('display', 'none');
        }
    }

    public SetNavigationCallback(onNavigation: (path: string) => void) {
        // This method can be used to wire up any initial event handlers
        $(window).on('hashchange', () => {
            const navTitle = location.hash.replace('#', '');
            onNavigation(navTitle);
            $(`.navigation li[data-action-name="${navTitle}"]`).click();
        });
    }

    public SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }

    public SetupNavigationEvents(onTitleSelected: (title: string) => void) {
        $('.navigation li').on('click', (e: any) => {
            const contentTitle = $(e.target).data('action-name');

            if (onTitleSelected) {
                onTitleSelected(contentTitle);
            }
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }

    public SetContentStageTitle(title: string) {
        $('.content-stage h2').text(title);
    }

    public SetNavigationFragment(path: string) {
        location.hash = path;
    }

    public ClearContentStage() {
        $('.content-stage .placeholder').html('');
    }

    public RenderOverviewContent(data: api.IOverviewData) {
        const overviewMarkup = `
            <ul class="overview">
                <li class="pending">Remediations Pending: <span>${
                    data.RemediationsPending
                }</span></li>
                <li class="completed">Remediations Completed: <span>${
                    data.RemediationsCompleted
                }</span></li>
                <li class="lastUpdated"><em>Last updated on ${data.LastRefreshed.toLocaleDateString()} at
                    ${data.LastRefreshed.toLocaleTimeString()}</em></li>
            </ul>
            <h3>Next Steps</h3>
            <p>To schedule a new remediation scan, click the button below:</p>
            <button>Schedule Scan</button>
        `;

        $('.content-stage .placeholder').html(overviewMarkup);
    }
}
