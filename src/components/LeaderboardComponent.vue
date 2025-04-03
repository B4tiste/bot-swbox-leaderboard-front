<template>
    <div class="leaderboard">
        <h1>
            BOT-SWBOX JSON SCORE LEADERBOARD
            <!-- Bouton redirigeant vers la page de stats -->
            <button @click="$router.push({ name: 'Stats' })" class="stats-btn">
                📊 Stats nerd button 📊
            </button>
        </h1>

        <h2>
            ⚠️ Only the scores are stored, JSON files are not uploaded to the
            Database ⚠️
        </h2>

        <!-- Barre de recherche -->
        <div class="search-bar">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Rechercher un pseudo..."
            />
        </div>

        <!-- Loader -->
        <div id="loader" class="loader" v-if="loading"></div>
        <table v-else>
            <thead>
                <tr>
                    <th class="non-clickable">Rank</th>
                    <th class="non-clickable">Pseudo</th>
                    <th class="non-clickable">JSON Date</th>
                    <th @click="sort('score_rta_eff')" class="clickable">
                        <div class="header-content">
                            <span>Score Eff% RTA</span>
                            <span
                                v-if="sortColumn === 'score_rta_eff'"
                                class="arrow"
                                :class="{ rotated: sortOrder === 'desc' }"
                                >⬆</span
                            >
                        </div>
                    </th>
                    <th @click="sort('score_siege_eff')" class="clickable">
                        <div class="header-content">
                            <span>Score Eff% Siege</span>
                            <span
                                v-if="sortColumn === 'score_siege_eff'"
                                class="arrow"
                                :class="{ rotated: sortOrder === 'desc' }"
                                >⬆</span
                            >
                        </div>
                    </th>
                    <th @click="sort('score_rta_spd')" class="clickable">
                        <div class="header-content">
                            <span>Score Speed RTA</span>
                            <span
                                v-if="sortColumn === 'score_rta_spd'"
                                class="arrow"
                                :class="{ rotated: sortOrder === 'desc' }"
                                >⬆</span
                            >
                        </div>
                    </th>
                    <th @click="sort('score_siege_spd')" class="clickable">
                        <div class="header-content">
                            <span>Score Speed Siege</span>
                            <span
                                v-if="sortColumn === 'score_siege_spd'"
                                class="arrow"
                                :class="{ rotated: sortOrder === 'desc' }"
                                >⬆</span
                            >
                        </div>
                    </th>
                </tr>
            </thead>
            <!-- Transition-group pour animer les déplacements -->
            <transition-group tag="tbody" name="row">
                <tr
                    v-for="player in sortedLeaderboard"
                    :key="player.id"
                    :class="[
                        getRankColorClass(player),
                        player.apparitionsCount > 1 && !player.anonyme
                            ? 'clickable-row'
                            : 'non-clickable-row',
                    ]"
                    @click="
                        player.apparitionsCount > 1 &&
                            !player.anonyme &&
                            handlePlayerClick(player)
                    "
                >
                    <td>
                        {{
                            fullSortedLeaderboard.findIndex(
                                (p) => p.id === player.id
                            ) + 1
                        }}
                    </td>
                    <td class="pseudo-cell">
                        {{ player.anonyme ? "HIDDEN" : player.pseudo }}
                        <span
                            v-if="
                                player.apparitionsCount > 1 && !player.anonyme
                            "
                            class="clickable-icon"
                            >📈</span
                        >
                    </td>
                    <td>{{ player.date }}</td>
                    <td>{{ player.score_rta_eff }}</td>
                    <td>{{ player.score_siege_eff }}</td>
                    <td>{{ player.score_rta_spd }}</td>
                    <td>{{ player.score_siege_spd }}</td>
                </tr>
            </transition-group>
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
            sortColumn: "score_rta_eff",
            sortOrder: "asc",
            loading: true,
            searchQuery: "",
        };
    },
    created() {
        axios
            .get(`${process.env.VUE_APP_API_URL}/leaderboard`)
            .then((response) => {
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
        // Liste complète triée (non filtrée)
        fullSortedLeaderboard() {
            return this.leaderboard.slice().sort((a, b) => {
                const modifier = this.sortOrder === "desc" ? -1 : 1;
                if (a[this.sortColumn] < b[this.sortColumn])
                    return 1 * modifier;
                if (a[this.sortColumn] > b[this.sortColumn])
                    return -1 * modifier;
                return 0;
            });
        },
        // Liste filtrée selon la recherche sur le pseudo
        filteredLeaderboard() {
            if (!this.searchQuery) return this.leaderboard;
            return this.leaderboard.filter((player) =>
                player.pseudo
                    .toLowerCase()
                    .includes(this.searchQuery.toLowerCase())
            );
        },
        // Liste filtrée et triée pour l'affichage
        sortedLeaderboard() {
            return this.filteredLeaderboard.slice().sort((a, b) => {
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
                this.sortOrder = this.sortOrder === "desc" ? "asc" : "desc";
            } else {
                this.sortColumn = column;
            }
        },
        getRankColorClass(player) {
            // On calcule la position globale du joueur (1 = premier, 2 = deuxième, 3 = troisième, etc.)
            const globalRank =
                this.fullSortedLeaderboard.findIndex(
                    (p) => p.id === player.id
                ) + 1;

            if (globalRank === 1) return "gold";
            if (globalRank === 2) return "silver";
            if (globalRank === 3) return "bronze";
            // Au-delà du top 3, pas de couleur
            return "";
        },
        handlePlayerClick(player) {
            this.$router.push({
                name: "PlayerDetail",
                params: { id: player.id },
            });
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
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px; /* espace entre le titre et le bouton */
}

.leaderboard h2 {
    text-align: center;
    color: #28a745;
    margin-bottom: 20px;
}

/* Bouton Stats */
.stats-btn {
    background-color: #28a745;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.3s ease;
}
.stats-btn:hover {
    background-color: #218838;
}

/* Barre de recherche */
.search-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.search-bar input {
    width: 300px;
    padding: 10px;
    border: none;
    border-radius: 4px;
    font-size: 1em;
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

.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50px;
}

.arrow {
    display: block;
    font-size: 2em;
    margin-top: 5px;
    transition: transform 0.3s ease;
    color: #28a745;
}

/* Rotation de 180° pour l'ordre décroissant */
.arrow.rotated {
    transform: rotate(180deg);
}

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

/* Colonnes cliquables */
thead th.clickable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
}

thead th.clickable:hover {
    background-color: #4a4a4a;
}

/* Cellules du tableau */
th,
td {
    padding: 12px 15px;
    border-bottom: 1px solid #3a3a3a;
    transition: background-color 0.3s ease;
    text-align: center;
    font-size: 1.1em;
}

/* Séparation verticale */
th:not(:last-child),
td:not(:last-child) {
    border-right: 2px solid #3a3a3a;
}

/* Hover sur les lignes cliquables */
tr.clickable-row:hover {
    background-color: #5a5a5a;
    cursor: pointer;
}

tr.non-clickable-row:hover {
    /* add a small "opacity" */
    background-color: #3a3a3a;
    cursor: default;
}

/* Style pour la cellule pseudo */
.pseudo-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}

.clickable-icon {
    margin-left: 8px;
    font-size: 1.2em;
    color: #28a745;
}

/* Suppression de la bordure sur la dernière ligne */
tbody tr:last-child td {
    border-bottom: none;
}

/* Animation pour le déplacement des lignes */
.row-move {
    transition: transform 0.5s;
}

/* Footer */
footer {
    text-align: center;
    margin-top: 30px;
    padding: 10px;
    background-color: #1e1e1e;
    color: #fff;
}

/* Highlighting for top three ranks with 50% transparency */
.gold {
    background-color: rgba(255, 215, 0, 0.5);
}

.silver {
    background-color: rgba(192, 192, 192, 0.5);
}

.bronze {
    background-color: rgba(205, 127, 50, 0.5);
}
</style>
