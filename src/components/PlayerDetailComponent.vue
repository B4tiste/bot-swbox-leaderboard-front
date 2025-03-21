<template>
    <div class="player-detail">
        <h1>Player Detail - {{ playerData?.player?.pseudo || "N/A" }}</h1>
        <!-- Loader -->
        <div id="loader" class="loader" v-if="loading"></div>
        <!-- Graph s'affiche quand le chargement est terminé -->
        <div v-else>
            <canvas id="scoreChart"></canvas>
        </div>
        <footer>
            <p>By <strong>B4tiste</strong> (@b4tiste on Discord)</p>
        </footer>
    </div>
</template>

<script>
import axios from "axios";
import { Chart } from "chart.js/auto";

export default {
    name: "PlayerDetailComponent",
    data() {
        return {
            playerData: null,
            loading: true,
            chart: null,
        };
    },
    mounted() {
        // Récupère l'ID du joueur depuis les paramètres de la route
        const playerId = this.$route.params.id;
        axios
            .get(`${process.env.VUE_APP_API_URL}/playerDetail/${playerId}`)
            .then((response) => {
                // On suppose que la réponse est au format { player: { ... } }
                this.playerData = response.data;
            })
            .catch((error) => {
                console.error(
                    "Erreur lors de la récupération des détails du joueur:",
                    error
                );
            })
            .finally(() => {
                // On définit loading à false, puis on attend que le DOM soit mis à jour avant de créer le graphique
                this.loading = false;
                this.$nextTick(() => {
                    this.createChart();
                });
            });
    },
    methods: {
        createChart() {
            if (!this.playerData || !this.playerData.player) return;
            const apparitions = this.playerData.player.apparitions;
            // Extraction des données pour le graphique
            const labels = apparitions.map((item) => item.date);
            const scoreEff = apparitions.map((item) => item.score_eff);
            const scoreSpd = apparitions.map((item) => item.score_spd);

            const canvas = document.getElementById("scoreChart");
            if (!canvas) {
                console.error("Canvas non trouvé !");
                return;
            }
            const ctx = canvas.getContext("2d");
            this.chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Score Eff",
                            data: scoreEff,
                            borderColor: "#28a745",
                            backgroundColor: "rgba(40, 167, 69, 0.2)",
                            fill: false, // Désactive le remplissage
                            tension: 0.2,
                        },
                        {
                            label: "Score Spd",
                            data: scoreSpd,
                            borderColor: "#ff5733",
                            backgroundColor: "rgba(255, 87, 51, 0.2)",
                            fill: false, // Désactive le remplissage
                            tension: 0.2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                        },
                        x: {
                            grid: { color: "#444" },
                            ticks: { color: "#fff" },
                        },
                    },
                    plugins: {
                        legend: {
                            labels: { color: "#fff" },
                        },
                    },
                },
            });
        },
    },
};
</script>

<style scoped>
.player-detail {
    background-color: #121212;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    color: #fff;
}

.player-detail h1 {
    text-align: center;
    color: #28a745;
    margin-bottom: 20px;
}

/* Définition de la taille du canvas pour le graphique */
#scoreChart {
    width: 100%;
    height: 400px;
}

/* Loader */
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

/* Footer */
footer {
    text-align: center;
    margin-top: 30px;
    padding: 10px;
    background-color: #1e1e1e;
    color: #fff;
}
</style>
