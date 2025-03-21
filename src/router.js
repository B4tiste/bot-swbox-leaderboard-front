// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import LeaderboardComponent from './components/LeaderboardComponent.vue';
import PlayerDetailComponent from './components/PlayerDetailComponent.vue';

const routes = [
    {
        path: '/',
        name: 'Leaderboard',
        component: LeaderboardComponent,
    },
    {
        path: '/playerDetail/:id',
        name: 'PlayerDetail',
        component: PlayerDetailComponent,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
