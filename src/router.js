// src/router.js
import { createRouter, createWebHistory } from "vue-router";
import LeaderboardComponent from "./components/LeaderboardComponent.vue";
import PlayerDetailComponent from "./components/PlayerDetailComponent.vue";
import StatsNerdsComponent from "./components/StatsNerdsComponent.vue"; // <-- import

const routes = [
    {
        path: "/",
        name: "Leaderboard",
        component: LeaderboardComponent,
    },
    {
        path: "/playerDetail/:id",
        name: "PlayerDetail",
        component: PlayerDetailComponent,
    },
    {
        path: "/stats",
        name: "Stats",
        component: StatsNerdsComponent, // <-- nouvelle route pour la page Stats
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
