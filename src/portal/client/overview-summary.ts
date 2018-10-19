import * as api from './api-client';

export default class OverviewSummary {
    public Render(data: api.IOverviewSummary) {
        // NOTE: Instead of the bar-chart idea, let's put a donut chart in with dynamic
        // SVG. See this article for a formal implementation:
        // https://medium.com/@heyoka/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72

        return `
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
    }
}
