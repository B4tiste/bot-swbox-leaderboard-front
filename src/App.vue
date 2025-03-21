<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
export default {
    name: "App",
};
</script>

<style>
/* Style global pour un thème sombre */
body,
#app {
    background-color: #121212;
    color: #ffffff;
    margin: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
