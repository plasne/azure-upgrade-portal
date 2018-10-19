// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.

import * as api from './api-client';
import OverviewSummary from './overview-summary';
import RemediationGrid from './remediation-grid';
import ScheduledJobsGrid from './scheduled-jobs-grid';
import { UiCommon } from './ui-common';

export interface IUIBinding {
    // Global event hook setup + busy / spinner mask control
    SetGlobalCallbacks(
        onDialogClose: () => void,
        onRefreshContent: () => void
    ): void;

    SetDetailsLinkCallback(onDetailsClick: (id: string) => void): void;
    SetBusyState(busy: boolean): void;

    // Handles events raised / impacted by the navigation elements
    SetNavigationCallback(onNavigation: (path: string) => void): void;
    SetupNavigationEvents(onTitleSelected: (title: string) => void): void;
    SelectDefaultNavigationItem(): void;
    SetContentStageTitle(title: string): void;
    SetNavigationFragment(path: string): void;

    // Methods that modify the content stage region
    ClearContentStage(): void;
    RenderOverviewContent(data: api.IOverviewSummary): void;
    RenderRemediationNeededContent(data: api.IRemediationNeeded): void;
    RenderRemediationCompletedContent(data: api.IRemediationCompleted): void;
    RenderScheduledJobsContent(data: api.IScheduledJobs): void;
    RenderDetailsView(data: api.IDetailsData): void;
}

export class UIBinding implements IUIBinding {
    public SetGlobalCallbacks(
        onDialogClose: () => void,
        onRefreshContent: () => void
    ) {
        // Handle closing of dialogs, and let app know
        $(document).on('click', 'button.dialogClose', (e: any) => {
            $(e.target)
                .parents('.dialog-stage')
                .hide();
            if (onDialogClose) {
                onDialogClose();
            }
        });

        // Handle any clicks from 'Refresh' toolbar items.
        $(document).on('click', '.dataGridToolbar .refreshContent', () => {
            if (onRefreshContent) {
                onRefreshContent();
            }
        });
    }
    public SetDetailsLinkCallback(onDetailsClick: (id: string) => void) {
        $(document).on('click', 'a.detailsViewLink', (e: any) => {
            // Notify app controller
            onDetailsClick($(e.target).data('item-name'));
        });
    }

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

    public RenderOverviewContent(data: api.IOverviewSummary) {
        const summary = new OverviewSummary();
        const markup = summary.Render(data);
        $('.content-stage .placeholder').html(markup);
    }

    public RenderRemediationNeededContent(data: api.IRemediationNeeded) {
        const g = new RemediationGrid();
        const markup = g.RenderNeeded(data);
        $('.content-stage .placeholder').html(markup);
    }

    public RenderRemediationCompletedContent(data: api.IRemediationCompleted) {
        const g = new RemediationGrid();
        const markup = g.RenderCompleted(data);
        $('.content-stage .placeholder').html(markup);
    }

    public RenderScheduledJobsContent(data: api.IScheduledJobs) {
        const g = new ScheduledJobsGrid();
        const markup = g.Render(data);
        $('.content-stage .placeholder').html(markup);
    }

    public RenderDetailsView(data: api.IDetailsData) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name} (${data.Type})</li>
                <li><strong>Duration:</strong> ${UiCommon.FormatDurationInMs(
                    data.DurationInMs
                )}</li>
            </ul>
            <textarea readonly>${data.UpgradeDescription}</textarea>
        `;

        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }
}
