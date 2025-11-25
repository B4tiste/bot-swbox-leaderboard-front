<template>
    <div class="leaderboard-page">
        <div class="leaderboard-card">
            <!-- Header -->
            <header class="leaderboard-header">
                <div class="title-block">
                    <h1>BOT-SWBOX JSON SCORE LEADERBOARD</h1>
                    <p class="subtitle">
                        Track the highest JSON scores across RTA & Siege — only scores are stored, never your JSON files.
                    </p>
                </div>
                <button
                    @click="$router.push({ name: 'Stats' })"
                    class="stats-btn"
                >
                    <span class="stats-icon">📊</span>
                    <span>Stats nerd button</span>
                </button>
            </header>

            <!-- Alert / info line -->
            <div class="info-banner">
                ⚠️ Only scores are stored. JSON files are <strong>not</strong> uploaded to the database.
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-wrapper">
                    <span class="search-icon">🔍</span>
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search by pseudo..."
                    />
                </div>

                <div class="sort-badge">
                    Sorting by:
                    <strong>{{ readableSortColumn }}</strong>
                    <span v-if="sortOrder === 'desc'">⬇</span>
                    <span v-else>⬆</span>
                </div>
            </div>

            <!-- Loader -->
            <div v-if="loading" class="loader-wrapper">
                <div class="loader"></div>
                <p>Loading leaderboard…</p>
            </div>

            <!-- Table -->
            <div v-else class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="non-clickable rank-col">Rank</th>
                            <th class="non-clickable pseudo-col">Pseudo</th>
                            <th class="non-clickable date-col">JSON Date</th>

                            <th @click="sort('score_rta_eff')" class="clickable">
                                <div class="header-content">
                                    <span>Score Eff% RTA</span>
                                    <span
                                        v-if="sortColumn === 'score_rta_eff'"
                                        class="arrow"
                                        :class="{ rotated: sortOrder === 'asc' }"
                                    >
                                        ⬆
                                    </span>
                                </div>
                            </th>

                            <th @click="sort('score_siege_eff')" class="clickable">
                                <div class="header-content">
                                    <span>Score Eff% Siege</span>
                                    <span
                                        v-if="sortColumn === 'score_siege_eff'"
                                        class="arrow"
                                        :class="{ rotated: sortOrder === 'asc' }"
                                    >
                                        ⬆
                                    </span>
                                </div>
                            </th>

                            <th @click="sort('score_rta_spd')" class="clickable">
                                <div class="header-content">
                                    <span>Score Speed RTA</span>
                                    <span
                                        v-if="sortColumn === 'score_rta_spd'"
                                        class="arrow"
                                        :class="{ rotated: sortOrder === 'asc' }"
                                    >
                                        ⬆
                                    </span>
                                </div>
                            </th>

                            <th @click="sort('score_siege_spd')" class="clickable">
                                <div class="header-content">
                                    <span>Score Speed Siege</span>
                                    <span
                                        v-if="sortColumn === 'score_siege_spd'"
                                        class="arrow"
                                        :class="{ rotated: sortOrder === 'asc' }"
                                    >
                                        ⬆
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <!-- Animated rows -->
                    <transition-group tag="tbody" name="row">
                        <tr
                            v-for="player in sortedLeaderboard"
                            :key="player.id"
                            :class="[
                                getRankColorClass(player),
                                player.apparitionsCount > 1 && !player.anonyme
                                    ? 'clickable-row'
                                    : 'non-clickable-row'
                            ]"
                            @click="
                                player.apparitionsCount > 1 &&
                                !player.anonyme &&
                                handlePlayerClick(player)
                            "
                        >
                            <td class="rank-col">
                                {{
                                    fullSortedLeaderboard.findIndex(
                                        (p) => p.id === player.id
                                    ) + 1
                                }}
                            </td>

                            <td class="pseudo-cell pseudo-col">
                                <span class="pseudo-text">
                                    {{ player.anonyme ? 'HIDDEN' : player.pseudo }}
                                </span>
                                <span
                                    v-if="player.apparitionsCount > 1 && !player.anonyme"
                                    class="clickable-icon"
                                    title="View player details"
                                >
                                    📈
                                </span>
                            </td>

                            <td class="date-col">
                                {{ player.date }}
                            </td>

                            <td>{{ player.score_rta_eff }}</td>
                            <td>{{ player.score_siege_eff }}</td>
                            <td>{{ player.score_rta_spd }}</td>
                            <td>{{ player.score_siege_spd }}</td>
                        </tr>
                    </transition-group>
                </table>

                <!-- Empty state -->
                <div v-if="!sortedLeaderboard.length" class="empty-state">
                    <p>No players match this search yet.</p>
                </div>
            </div>

            <!-- Footer -->
            <footer class="leaderboard-footer">
                <p>
                    By <strong>B4tiste</strong> (<span class="discord-tag">@b4tiste</span> on Discord)
                </p>
            </footer>
        </div>
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
            sortOrder: "desc", // default to highest first
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
        // Human-readable label for the current sort column
        readableSortColumn() {
            const map = {
                score_rta_eff: "Eff% RTA",
                score_siege_eff: "Eff% Siege",
                score_rta_spd: "Speed RTA",
                score_siege_spd: "Speed Siege",
            };
            return map[this.sortColumn] || this.sortColumn;
        },

        // Full sorted leaderboard (not filtered) - used to compute true rank
        fullSortedLeaderboard() {
            return this.leaderboard.slice().sort((a, b) => {
                const modifier = this.sortOrder === "desc" ? -1 : 1;
                if (a[this.sortColumn] < b[this.sortColumn]) return 1 * modifier;
                if (a[this.sortColumn] > b[this.sortColumn]) return -1 * modifier;
                return 0;
            });
        },

        // Filter by pseudo
        filteredLeaderboard() {
            if (!this.searchQuery) return this.leaderboard;
            return this.leaderboard.filter((player) =>
                player.pseudo
                    .toLowerCase()
                    .includes(this.searchQuery.toLowerCase())
            );
        },

        // Filtered and sorted for display
        sortedLeaderboard() {
            return this.filteredLeaderboard.slice().sort((a, b) => {
                const modifier = this.sortOrder === "desc" ? -1 : 1;
                if (a[this.sortColumn] < b[this.sortColumn]) return 1 * modifier;
                if (a[this.sortColumn] > b[this.sortColumn]) return -1 * modifier;
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
                // keep current order, user can toggle
            }
        },
        getRankColorClass(player) {
            const globalRank =
                this.fullSortedLeaderboard.findIndex(
                    (p) => p.id === player.id
                ) + 1;

            if (globalRank === 1) return "gold";
            if (globalRank === 2) return "silver";
            if (globalRank === 3) return "bronze";
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
/* Page background */
.leaderboard-page {
    min-height: 100vh;
    padding: 24px;
    background: radial-gradient(circle at top, #1f2933 0, #05080b 50%, #020203 100%);
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

/* Card container */
.leaderboard-card {
    width: 100%;
    max-width: 1100px;
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 20px 24px 16px;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(40, 167, 69, 0.5);
}

/* Header */
.leaderboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
}

.title-block h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #e9ffe9;
    text-transform: uppercase;
}

.subtitle {
    margin-top: 6px;
    font-size: 0.9rem;
    color: #a9e6b7;
}

/* Stats button */
.stats-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #28a745, #46d369);
    color: #050505;
    border: none;
    padding: 10px 14px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(40, 167, 69, 0.6);
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.stats-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 20px rgba(40, 167, 69, 0.9);
    filter: brightness(1.05);
}

.stats-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.6);
}

.stats-icon {
    font-size: 1.1rem;
}

/* Info banner */
.info-banner {
    background: rgba(40, 167, 69, 0.08);
    border: 1px solid rgba(40, 167, 69, 0.4);
    color: #bdf5c4;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: 16px;
}

/* Toolbar: search + sort info */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
}

/* Search bar */
.search-wrapper {
    flex: 1;
    min-width: 220px;
    display: flex;
    align-items: center;
    background: #111;
    border-radius: 999px;
    padding: 6px 12px;
    border: 1px solid #333;
}

.search-wrapper:focus-within {
    border-color: #28a745;
    box-shadow: 0 0 0 1px rgba(40, 167, 69, 0.6);
}

.search-icon {
    margin-right: 6px;
    font-size: 0.9rem;
}

.search-wrapper input {
    background: transparent;
    border: none;
    outline: none;
    color: #f5f5f5;
    width: 100%;
    font-size: 0.9rem;
}

/* Sort badge */
.sort-badge {
    font-size: 0.85rem;
    color: #c9e4d0;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 999px;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* Loader */
.loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0 30px;
    color: #ffffff;
    gap: 10px;
}

.loader {
    border: 6px solid rgba(243, 243, 243, 0.1);
    border-top: 6px solid #28a745;
    border-radius: 50%;
    width: 52px;
    height: 52px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Table container (for horizontal scroll on mobile) */
.table-container {
    width: 100%;
    overflow-x: auto;
    border-radius: 10px;
    background: #050505;
    border: 1px solid #242424;
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
}

/* Table header */
thead th {
    background: #151515;
    padding: 10px 10px;
    color: #f8fff8;
    font-weight: 600;
    text-align: center;
    font-size: 0.9rem;
    border-bottom: 1px solid #282828;
}

thead th.clickable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
}

thead th.clickable:hover {
    background-color: #202020;
}

.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.arrow {
    display: block;
    font-size: 1.2rem;
    margin-top: 2px;
    transition: transform 0.2s ease;
    color: #28a745;
}

/* sortOrder = 'asc' => rotated up vs down (we flip logic here) */
.arrow.rotated {
    transform: rotate(180deg);
}

/* Cells */
th,
td {
    padding: 10px 10px;
    border-bottom: 1px solid #222;
    font-size: 0.9rem;
    text-align: center;
    color: #e6e6e6;
}

/* Column sizing hints */
.rank-col {
    width: 60px;
}

.pseudo-col {
    min-width: 140px;
}

.date-col {
    min-width: 110px;
}

/* Vertical separators */
th:not(:last-child),
td:not(:last-child) {
    border-right: 1px solid #222;
}

/* Row states */
tr.clickable-row:hover {
    background: rgba(40, 167, 69, 0.09);
    cursor: pointer;
}

tr.non-clickable-row:hover {
    background: #181818;
    cursor: default;
}

tbody tr:last-child td {
    border-bottom: none;
}

/* Pseudo cell */
.pseudo-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.pseudo-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
}

.clickable-icon {
    font-size: 1.1rem;
    color: #28a745;
}

/* Top 3 highlighting */
.gold {
    background: linear-gradient(
        90deg,
        rgba(255, 215, 0, 0.18),
        rgba(255, 215, 0, 0.05)
    );
}

.silver {
    background: linear-gradient(
        90deg,
        rgba(192, 192, 192, 0.18),
        rgba(192, 192, 192, 0.05)
    );
}

.bronze {
    background: linear-gradient(
        90deg,
        rgba(205, 127, 50, 0.18),
        rgba(205, 127, 50, 0.05)
    );
}

/* Row animation */
.row-move {
    transition: transform 0.35s ease;
}

/* Empty state */
.empty-state {
    padding: 18px;
    text-align: center;
    color: #b4b4b4;
    font-size: 0.9rem;
}

/* Footer */
.leaderboard-footer {
    text-align: center;
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px solid #1b1b1b;
    color: #d5d5d5;
    font-size: 0.85rem;
}

.discord-tag {
    color: #8ab4ff;
}

/* Responsive tweaks */
@media (max-width: 768px) {
    .leaderboard-card {
        padding: 16px;
    }

    .leaderboard-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .title-block h1 {
        font-size: 1.3rem;
    }

    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .sort-badge {
        align-self: flex-start;
    }
}
</style>
