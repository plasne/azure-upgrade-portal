// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.

import * as api from './api-client';

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
        // NOTE: Instead of the bar-chart idea, let's put a donut chart in with dynamic
        // SVG. See this article for a formal implementation:
        // https://medium.com/@heyoka/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72

        const markup = `
            <div class="overview successChart">
                <div class="failedBar">
                    <div class="successBar" style="width: ${data.SuccessPercentage *
                        100}%">
                        <p>Success rate: ${data.SuccessPercentage * 100}%</p>
                    </div>
                </div>
            </div>

            <ul class="overview listNone">
                <li class="pending">Remediations Pending: <span>${
                    data.RemediationsPending
                }</span></li>
                <li class="completed">Remediations Completed: <span>${
                    data.RemediationsCompleted
                }</span></li>
                <li class="failed">Remediations Failed: <span>${
                    data.RemediationsFailed
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
                <p>The following systems are found to need compute upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group Selected</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup Selected</li>
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationNeededRows(data)}
                </table>
            </div>
            <div class="dataRegion">
                <p>The following systems are found to need storage account upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group Selected</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup Selected</li>
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationNeededRows(data)}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderRemediationCompletedContent(data: api.IRemediationCompleted) {
        const markup = `
            <div class="dataRegion">
                <p></i>The following systems have completed compute ugprades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationCompletedRows(data)}
                </table>
            </div>
            <div class="dataRegion">
                <p>The following systems have completed storage account upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="100px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Name</td>
                        <td>Group</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                    ${this.renderRemediationCompletedRows(data)}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderScheduledJobsContent(data: api.IScheduledJobs) {
        const markup = `
            <div class="dataRegion">
                <p></i>Current scheduled job status:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li class="refreshContent" title="Refresh"><i class="fas fa-sync"></i>Refresh</li>
                    </ul>
                </div>
                <table class="dataGrid">
                    <colgroup>
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="headerRow">
                        <td>Job Type</td>
                        <td>Status</td>
                        <td>Duration</td>
                        <td>Job Log</td>
                        <td>Last Update</td>
                    </tr>
                    ${this.renderScheduledJobsRows(data)}
                </table>
            </div>
        `;

        $('.content-stage .placeholder').html(markup);
    }

    public RenderDetailsView(data: api.IDetailsData) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name} (${data.Type})</li>
                <li><strong>Duration:</strong> ${this.formatDurationInMs(
                    data.DurationInMs
                )}</li>
            </ul>
            <textarea readonly>${data.UpgradeDescription}</textarea>
        `;

        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }

    private formatDurationInMs(durationInMs: number) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }

    private renderRemediationNeededRows(data: api.IRemediationNeeded) {
        return data.NeedsComputeUpgrade.map(item => {
            return `
            <tr>
                <td><input type="checkbox" /></td>
                <td>${item.Name}</td>
                <td>${item.Group}</td>
                <td>${item.Type}</td>
                <td>${item.UpgradeDescription}</td>
                <td><a class="detailsViewLink" data-item-name="${
                    item.Name
                }">Click to view...</a></td>
            </tr>
            `;
        }).join('');
    }

    private renderRemediationCompletedRows(data: api.IRemediationCompleted) {
        return data.HadComputeUpgraded.map(item => {
            return `
            <tr>
                <td>${item.Name}</td>
                <td>${item.Group}</td>
                <td>${item.Type}</td>
                <td>${this.formatDurationInMs(item.DurationInMs)}</td>
                <td><a class="detailsViewLink" data-item-name="${
                    item.Name
                }">Click to view...</a></td>
            </tr>
            `;
        }).join('');
    }

    private renderScheduledJobsRows(data: api.IScheduledJobs) {
        return data.JobList.map(item => {
            return `
            <tr>
                <td>${item.JobType}</td>
                <td>${item.Status}</td>
                <td>${this.formatDurationInMs(item.DurationInMs)}</td>
                <td><a class="detailsViewLink" data-item-name="${
                    item.JobId
                }">View Log...</a></td>
                <td>${item.LastUpdate.toLocaleDateString()} ${item.LastUpdate.toLocaleTimeString()}</td>
            </tr>
            `;
        }).join('');
    }
}