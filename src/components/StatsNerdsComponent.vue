<template>
    <div class="stats-nerds">
        <!-- Bouton de retour -->
        <button class="back-button" @click="goBack">Back</button>

        <h1>Statistics</h1>

        <div v-if="loading">
            <!-- Same loader as in Leaderboard -->
            <div id="loader" class="loader"></div>
        </div>
        <div v-else>
            <label for="metric-select">Choose a metric:</label>
            <select id="metric-select" v-model="selectedMetric">
                <option value="score_rta_eff">Score RTA Eff%</option>
                <option value="score_siege_eff">Score Siege Eff%</option>
                <option value="score_rta_spd">Score RTA Spd</option>
                <option value="score_siege_spd">Score Siege Spd</option>
            </select>

            <!-- Histogram -->
            <canvas ref="histogramChart" class="chart-canvas"></canvas>

            <!-- Vertical Distribution (horizontal bar chart) -->
            <canvas ref="distributionChart" class="chart-canvas"></canvas>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
    name: "StatsNerdsComponent",
    data() {
        return {
            leaderboard: [],
            loading: true,
            selectedMetric: "score_rta_eff",
            charts: [],
        };
    },
    mounted() {
        this.fetchLeaderboard();
    },
    watch: {
        selectedMetric() {
            this.renderCharts();
        },
    },
    methods: {
        fetchLeaderboard() {
            axios
                .get(`${process.env.VUE_APP_API_URL}/leaderboard`)
                .then((response) => {
                    this.leaderboard = response.data.leaderboard || [];
                })
                .catch((error) => {
                    console.error("Error fetching leaderboard:", error);
                })
                .finally(() => {
                    this.loading = false;
                    this.$nextTick(() => {
                        this.renderCharts();
                    });
                });
        },
        clearCharts() {
            this.charts.forEach((chart) => chart.destroy());
            this.charts = [];
        },
        renderCharts() {
            this.clearCharts();

            if (!this.leaderboard.length) {
                return;
            }

            // --- Extract values for the selected metric
            const values = this.leaderboard
                .map((p) => p[this.selectedMetric])
                .filter((v) => typeof v === "number");

            if (!values.length) return;

            const minVal = Math.min(...values);
            const maxVal = Math.max(...values);

            // === 1) HISTOGRAM
            const ctxHistogram = this.$refs.histogramChart.getContext("2d");

            // Define bin size (e.g., 250)
            const binSize = 250;
            const binCount = Math.ceil((maxVal - minVal) / binSize);
            const bins = Array(binCount).fill(0);

            values.forEach((v) => {
                const index = Math.min(
                    Math.floor((v - minVal) / binSize),
                    binCount - 1
                );
                bins[index]++;
            });

            const binLabels = bins.map((_, i) => {
                const start = minVal + i * binSize;
                const end = start + binSize;
                return `${Math.round(start)} - ${Math.round(end)}`;
            });

            const histogramChart = new Chart(ctxHistogram, {
                type: "bar",
                data: {
                    labels: binLabels,
                    datasets: [
                        {
                            label: "Amount of players",
                            data: bins,
                            backgroundColor: "#28a745",
                            yAxisID: "y",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Histogram - ${this.selectedMetric}`,
                            color: "#fff",
                        },
                        legend: {
                            labels: { color: "#fff" },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Bins",
                                color: "#fff",
                            },
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                            type: "category",
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Number of players",
                                color: "#fff",
                            },
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                            type: "linear",
                            position: "left",
                        },
                    },
                },
            });

            // === 2) VERTICAL DISTRIBUTION (HORIZONTAL BAR CHART)
            const ctxDistribution =
                this.$refs.distributionChart.getContext("2d");

            // Sort players by descending value of the selected metric
            const sortedPlayers = this.leaderboard
                .filter((p) => typeof p[this.selectedMetric] === "number")
                .sort(
                    (a, b) => b[this.selectedMetric] - a[this.selectedMetric]
                );

            // Replace username with "HIDDEN" if the player is anonymous
            const distributionLabels = sortedPlayers.map((p) =>
                p.anonyme ? "HIDDEN" : p.pseudo
            );
            const distributionData = sortedPlayers.map(
                (p) => p[this.selectedMetric]
            );

            const distributionChart = new Chart(ctxDistribution, {
                type: "bar",
                data: {
                    labels: distributionLabels,
                    datasets: [
                        {
                            label: `${this.selectedMetric}`,
                            data: distributionData,
                            backgroundColor: "#007bff",
                        },
                    ],
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Distribution by Username - ${this.selectedMetric}`,
                            color: "#fff",
                        },
                        legend: {
                            labels: { color: "#fff" },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: this.selectedMetric,
                                color: "#fff",
                            },
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                        },
                        y: {
                            title: { display: false },
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                        },
                    },
                },
            });

            this.charts = [histogramChart, distributionChart];
        },
        // Method to return to the Leaderboard page
        goBack() {
            this.$router.push({ name: "Leaderboard" });
        },
    },
};
</script>

<style scoped>
.stats-nerds {
    margin-top: 30px;
    background-color: #1e1e1e;
    padding: 20px;
    border-radius: 10px;
    color: #fff;
}
.stats-nerds h1 {
    text-align: center;
    color: #28a745;
    margin-bottom: 20px;
}
#metric-select {
    margin-left: 10px;
    background-color: #121212;
    color: #fff;
    border: 1px solid #28a745;
    border-radius: 4px;
    padding: 5px;
}
.chart-canvas {
    margin-top: 30px;
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 10px;
    max-height: 600px;
    width: 100%;
}
.loader {
    border: 8px solid #f3f3f3;
    border-top: 8px solid #28a745;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
.back-button {
    margin-bottom: 15px;
    background-color: #28a745;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.back-button:hover {
    background-color: #218838;
}
</style>
