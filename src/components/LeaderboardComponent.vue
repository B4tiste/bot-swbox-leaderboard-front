<template>
    <div class="leaderboard">
        <h1>BOT-SWBOX JSON SCORE LEADERBOARD</h1>
        <!-- Loader -->
        <div id="loader" class="loader" v-if="loading"></div>
        <table v-else>
            <thead>
                <tr>
                    <th class="non-clickable">ID</th>
                    <th class="non-clickable">Pseudo</th>
                    <th class="non-clickable">JSON Date</th>
                    <th @click="sort('score_eff')" class="clickable">
                        <div class="header-content">
                            <span>Score Eff</span>
                            <span class="arrow">
                                {{
                                    sortColumn === "score_eff"
                                        ? sortOrder === "desc"
                                            ? "↓"
                                            : "↑"
                                        : ""
                                }}
                            </span>
                        </div>
                    </th>
                    <th @click="sort('score_spd')" class="clickable">
                        <div class="header-content">
                            <span>Score Spd</span>
                            <span class="arrow">
                                {{
                                    sortColumn === "score_spd"
                                        ? sortOrder === "desc"
                                            ? "↓"
                                            : "↑"
                                        : ""
                                }}
                            </span>
                        </div>
                    </th>
                    <th @click="sort('total')" class="clickable">
                        <div class="header-content">
                            <span>Total</span>
                            <span class="arrow">
                                {{
                                    sortColumn === "total"
                                        ? sortOrder === "desc"
                                            ? "↓"
                                            : "↑"
                                        : ""
                                }}
                            </span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="player in sortedLeaderboard"
                    :key="player.id"
                    @click="
                        $router.push({
                            name: 'PlayerDetail',
                            params: { id: player.id },
                        })
                    "
                >
                    <td>{{ player.id }}</td>
                    <td>{{ player.pseudo }}</td>
                    <td>{{ player.date }}</td>
                    <td>{{ player.score_eff }}</td>
                    <td>{{ player.score_spd }}</td>
                    <td>{{ player.total }}</td>
                </tr>
            </tbody>
        </table>
        <footer>
            <p>By <strong>B4tiste</strong> (@b4tiste on Discord)</p>
        </footer>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "LeaderboardComponent",
    data() {
        return {
            leaderboard: [],
            // Tri par défaut sur la colonne "total"
            sortColumn: "total",
            sortOrder: "asc",
            loading: true,
        };
    },
    created() {
        axios
            .get(`${process.env.VUE_APP_API_URL}/leaderboard`)
            .then((response) => {
                // On suppose que la réponse est { leaderboard: [...] }
                this.leaderboard = response.data.leaderboard;
            })
            .catch((error) => {
                console.error(
                    "Erreur lors de la récupération du leaderboard:",
                    error
                );
            })
            .finally(() => {
                this.loading = false;
            });
    },
    computed: {
        sortedLeaderboard() {
            return this.leaderboard.slice().sort((a, b) => {
                const modifier = this.sortOrder === "desc" ? -1 : 1;
                if (a[this.sortColumn] < b[this.sortColumn])
                    return 1 * modifier;
                if (a[this.sortColumn] > b[this.sortColumn])
                    return -1 * modifier;
                return 0;
            });
        },
    },
    methods: {
        sort(column) {
            if (this.sortColumn === column) {
                // Inverse l'ordre si on clique deux fois sur la même colonne
                this.sortOrder = this.sortOrder === "desc" ? "asc" : "desc";
            } else {
                // Change de colonne et applique l'ordre décroissant par défaut
                this.sortColumn = column;
                this.sortOrder = "desc";
            }
        },
    },
};
</script>

<style scoped>
.leaderboard {
    background-color: #121212;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.leaderboard h1 {
    text-align: center;
    color: #28a745;
    margin-bottom: 20px;
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

/* Animation du loader */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Base du tableau */
table {
    width: 100%;
    border-collapse: collapse;
    background-color: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
}

/* En-têtes du tableau */
thead th {
    background-color: #3a3a3a;
    padding: 12px 15px;
    color: #ffffff;
    font-weight: 600;
    text-align: center;
}

/* Pour les colonnes cliquables uniquement */
thead th.clickable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
}

thead th.clickable:hover {
    background-color: #4a4a4a;
}

/* Contenu des en-têtes avec texte et flèche arrangés verticalement */
.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Flèche : fixe en largeur pour éviter le redimensionnement et agrandie */
.arrow {
    display: inline-block;
    width: 20px;
    font-size: 1.5em;
    line-height: 1;
    margin-top: 4px;
}

/* Cellules du tableau */
th,
td {
    padding: 12px 15px;
    border-bottom: 1px solid #3a3a3a;
    transition: background-color 0.3s ease;
    text-align: center;
}

/* Délimitation verticale de 2px entre les colonnes */
th:not(:last-child),
td:not(:last-child) {
    border-right: 2px solid #3a3a3a;
}

/* Effet hover sur les lignes du tableau */
tbody tr:hover {
    background-color: #5a5a5a;
}

/* Suppression de la bordure inférieure sur la dernière ligne */
tbody tr:last-child td {
    border-bottom: none;
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
