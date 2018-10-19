import * as api from './api-client';
import { UiCommon } from './ui-common';

export default class ScheduledJobsGrid {
    public Render(data: api.IScheduledJobs) {
        return `
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
    }

    private renderScheduledJobsRows(data: api.IScheduledJobs) {
        return data.JobList.reduce((prev, item) => {
            return (
                prev +
                `
                <tr>
                    <td>${item.JobType}</td>
                    <td>${item.Status}</td>
                    <td>${UiCommon.FormatDurationInMs(item.DurationInMs)}</td>
                    <td><a class="detailsViewLink" data-item-name="${
                        item.JobId
                    }">View Log...</a></td>
                    <td>${item.LastUpdate.toLocaleDateString()} ${item.LastUpdate.toLocaleTimeString()}</td>
                </tr>
                `
            );
        }, '');
    }
}
