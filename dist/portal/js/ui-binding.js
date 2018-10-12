"use strict";
// UI Bindings allow the separation of the UI/DOM components from the core application logic.
// This is primarily done to enable testing.
Object.defineProperty(exports, "__esModule", { value: true });
class UIBinding {
    SetGlobalCallbacks() {
        $(document).on('click', 'button.dialogClose', (e) => {
            console.log('Dialog close button clicked');
            $(e.target)
                .parents('.dialog-stage')
                .hide();
        });
    }
    SetDetailsLinkCallback(onDetailsClick) {
        $(document).on('click', 'a.detailsViewLink', (e) => {
            // Notify app controller
            onDetailsClick($(e.target).data('item-name'));
        });
    }
    SetBusyState(busy) {
        if (busy) {
            $('.loadingSpinner').css('display', 'block');
        }
        else {
            $('.loadingSpinner').css('display', 'none');
        }
    }
    SetNavigationCallback(onNavigation) {
        // This method can be used to wire up any initial event handlers
        $(window).on('hashchange', () => {
            const navTitle = location.hash.replace('#', '');
            onNavigation(navTitle);
            $(`.navigation li[data-action-name="${navTitle}"]`).click();
        });
    }
    SelectDefaultNavigationItem() {
        $('.navigation li.selected').click();
    }
    SetupNavigationEvents(onTitleSelected) {
        $('.navigation li').on('click', (e) => {
            const contentTitle = $(e.target).data('action-name');
            if (onTitleSelected) {
                onTitleSelected(contentTitle);
            }
            $('.navigation li').removeClass('selected');
            $(e.target).addClass('selected');
        });
    }
    SetContentStageTitle(title) {
        $('.content-stage h2').text(title);
    }
    SetNavigationFragment(path) {
        location.hash = path;
    }
    ClearContentStage() {
        $('.content-stage .placeholder').html('');
    }
    RenderOverviewContent(data) {
        const markup = `
            <ul class="overview">
                <li class="pending">Remediations Pending: <span>${data.RemediationsPending}</span></li>
                <li class="completed">Remediations Completed: <span>${data.RemediationsCompleted}</span></li>
                <li class="lastUpdated"><em>Last updated on ${data.LastRefreshed.toLocaleDateString()} at
                    ${data.LastRefreshed.toLocaleTimeString()}</em></li>
            </ul>
            <h3>Next Steps</h3>
            <p>To schedule a new remediation scan, click the button below:</p>
            <button>Schedule Scan<i class="fas fa-arrow-right"></i></button>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderRemediationNeededContent(data) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems are found to need compute upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsComputeUpgrade.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                item.UpgradeDescription +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems are found to need storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Description</td>
                        <td>Details</td>
                    </tr>
                ${data.NeedsStorageUpgrade.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                item.UpgradeDescription +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderRemediationCompletedContent(data) {
        const markup = `
            <div class="dataRegion">
                <p><i class="fas fa-server"></i>The following systems have completed compute ugprades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadComputeUpgraded.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
            <div class="dataRegion">
                <p><i class="far fa-hdd"></i>The following systems have completed storage account upgrades:</p>
                <table class="dataGrid">
                    <colgroup>
                        <col width="25px" />
                        <col width="200px" />
                        <col width="200px" />
                        <col width="100px" />
                        <col width="*" />
                    </colgroup>
                    <tr class="header">
                        <td>&nbsp;</td>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Duration</td>
                        <td>Details</td>
                    </tr>
                ${data.HadStorageUpgraded.map(item => {
            return ('<tr><td><input type="checkbox" /></td><td>' +
                item.Name +
                '</td><td>' +
                item.Type +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td><a class="detailsViewLink" data-item-name="' +
                item.Name +
                '">Click to view...</a></td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderScheduledJobsContent(data) {
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
                        <td>Name</td>
                        <td>Status</td>
                        <td>Duration</td>
                        <td>Last Update</td>
                    </tr>
                ${data.JobList.map(item => {
            return ('<tr><td>' +
                item.Name +
                '</td><td>' +
                item.Status +
                '</td><td>' +
                this.formatDurationInMs(item.DurationInMs) +
                '</td><td>' +
                item.LastUpdate.toLocaleDateString() +
                ' ' +
                item.LastUpdate.toLocaleTimeString() +
                '</td></tr>');
        }).join('')}
                </table>
            </div>
        `;
        $('.content-stage .placeholder').html(markup);
    }
    RenderDetailsView(data) {
        const markup = `
            <h2>Remediation Details</h2>
            <ul class="listNone marginBottom">
                <li><strong>Name:</strong> ${data.Name}</li>
                <li><strong>Duration:</strong> ${data.Type} (${this.formatDurationInMs(data.DurationInMs)})</li>
            </ul>
            <textarea>${data.UpgradeDescription}</textarea>
        `;
        $('.dialog-stage .placeholder').html(markup);
        $('.dialog-stage').show();
    }
    formatDurationInMs(durationInMs) {
        const mins = durationInMs / (60 * 1000);
        return `${mins.toFixed(2)} mins`;
    }
}
exports.UIBinding = UIBinding;
