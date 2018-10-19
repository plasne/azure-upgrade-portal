import * as api from './api-client';

export default class OverviewSummary {
    public Render(data: api.IOverviewSummary) {
        // Builds up the overview as well as the dynamic SVG charts
        return `
            <div>
                <h3>Remediation Job Summary</h3>

                <div class="overview successChart fLeft">
                    <svg width="12em" viewBox="0 0 42 42" class="donut">
                        <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                        <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#c44" stroke-width="4"></circle>
                        <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#080" stroke-width="4" stroke-dasharray="85 15" stroke-dashoffset="0"></circle>
                        <g class="chart-text">
                            <text x="50%" y="50%" class="chart-number">${data.SuccessPercentage *
                                100.0}%</text>
                        </g>
                    </svg>
                </div>

                <ul class="overview listNone fLeft">
                    <li class="pending">Pending: <span>${
                        data.RemediationsPending
                    }</span></li>
                    <li class="completed">Completed: <span>${
                        data.RemediationsCompleted
                    }</span></li>
                    <li class="failed">Failed: <span>${
                        data.RemediationsFailed
                    }</span></li>
                </ul>

                <p class="lastUpdated clear"><em>Last updated on ${data.LastRefreshed.toLocaleDateString()} at
                ${data.LastRefreshed.toLocaleTimeString()}</em></p>
            </div>

            <h3>Next Steps</h3>
            <p>To schedule a new remediation scan, click the button below:</p>
            <button>Schedule Scan<i class="fas fa-arrow-right"></i></button>
        `;
    }
}
