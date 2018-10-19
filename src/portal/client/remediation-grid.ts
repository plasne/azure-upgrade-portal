import * as api from './api-client';
import { UiCommon } from './ui-common';

export default class RemediationGrid {
    public RenderNeeded(data: api.IRemediationNeeded) {
        return `
            <div class="dataRegion">
                <p>The following systems are found to need compute upgrades:</p>
                <div class="dataGridToolbar">
                    <ul class="listNone">
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup</li>
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
                        <li title="Group Selected"><i class="far fa-object-group"></i>Group</li>
                        <li title="Ungroup Selected"><i class="far fa-object-ungroup"></i>Ungroup</li>
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
    }

    public RenderCompleted(data: api.IRemediationCompleted) {
        return `<div class="dataRegion">
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
                <td>${UiCommon.FormatDurationInMs(item.DurationInMs)}</td>
                <td><a class="detailsViewLink" data-item-name="${
                    item.Name
                }">Click to view...</a></td>
            </tr>
            `;
        }).join('');
    }
}
