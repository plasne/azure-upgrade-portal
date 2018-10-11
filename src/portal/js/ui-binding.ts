// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.

import * as api from './api-client';

export interface IUIBinding {
    // Global event hook setup + busy / spinner mask control
    SetGlobalCallbacks(): void;
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
    public SetGlobalCallbacks() {
        $(document).on('click', 'button.dialogClose', (e: any) => {
            console.log('Dialog close button clicked');
            $(e.target)
                .parents('.dialog-stage')
                .hide();
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
        const markup = `
            <ul class="overview listNone">
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
            <button>Schedule Scan<i class="fas fa-arrow-right"></i></button>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderRemediationNeededContent(data: api.IRemediationNeeded) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems are found to need compute upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsComputeUpgrade.map(item => {
                    return (
                        '<tr><td><input type="checkbox" /></td><td>' +
                        item.Name +
                        '</td><td>' +
                        item.Group +
                        '</td><td>' +
                        item.Type +
                        '</td><td>' +
                        item.UpgradeDescription +
                        '</td><td><a class="detailsViewLink" data-item-name="' +
                        item.Name +
                        '">Click to view...</a></td></tr>'
                    );
                }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems are found to need storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsStorageUpgrade.map(item => {
                    return (
                        '<tr><td><input type="checkbox" /></td><td>' +
                        item.Name +
                        '</td><td>' +
                        item.Group +
                        '</td><td>' +
                        item.Type +
                        '</td><td>' +
                        item.UpgradeDescription +
                        '</td><td><a class="detailsViewLink" data-item-name="' +
                        item.Name +
                        '">Click to view...</a></td></tr>'
                    );
                }).join('')}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderRemediationCompletedContent(data: api.IRemediationCompleted) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems have completed compute ugprades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadComputeUpgraded.map(item => {
                    return (
                        '<tr><td><input type="checkbox" /></td><td>' +
                        item.Name +
                        '</td><td>' +
                        item.Group +
                        '</td><td>' +
                        item.Type +
                        '</td><td>' +
                        this.formatDurationInMs(item.DurationInMs) +
                        '</td><td><a class="detailsViewLink" data-item-name="' +
                        item.Name +
                        '">Click to view...</a></td></tr>'
                    );
                }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems have completed storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadStorageUpgraded.map(item => {
                    return (
                        '<tr><td><input type="checkbox" /></td><td>' +
                        item.Name +
                        '</td><td>' +
                        item.Group +
                        '</td><td>' +
                        item.Type +
                        '</td><td>' +
                        this.formatDurationInMs(item.DurationInMs) +
                        '</td><td><a class="detailsViewLink" data-item-name="' +
                        item.Name +
                        '">Click to view...</a></td></tr>'
                    );
                }).join('')}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderScheduledJobsContent(data: api.IScheduledJobs) {
        const markup = `
            <div class="dataRegion">
                <p><i class="far fa-clock"></i>Current scheduled job status:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>Job Type</td>
                        <td>Status</td>
                        <td>Duration</td>
                        <td>Last Update</td>
                    </tr>
                ${data.JobList.map(item => {
                    return (
                        '<tr><td>' +
                        item.JobType +
                        '</td><td>' +
                        item.Status +
                        '</td><td>' +
                        this.formatDurationInMs(item.DurationInMs) +
                        '</td><td>' +
                        item.LastUpdate.toLocaleDateString() +
                        ' ' +
                        item.LastUpdate.toLocaleTimeString() +
                        '</td></tr>'
                    );
                }).join('')}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderDetailsView(data: api.IDetailsData) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name}</li>
                <li><strong>Duration:</strong> ${
                    data.Type
                } (${this.formatDurationInMs(data.DurationInMs)})</li>
            </ul>
            <textarea>${data.UpgradeDescription}</textarea>
        `;

        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }

    private formatDurationInMs(durationInMs: number) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }
}
