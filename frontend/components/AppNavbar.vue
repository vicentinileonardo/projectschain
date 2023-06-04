<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <nav class="navbar bg-primary">
        <RouterLink class="navbar-logo" to="/">
            <img src="@/assets/blockchain.png" alt="Logo" height="36">
            <span>ProjectsChain</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
.navbar {
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    padding: 0.5em 0.5em;
}

.navbar a {
    color: white;
    font-weight: bold;
    font-size: large;
    text-decoration: none;
}

.navbar-logo {
    display: flex;
    align-items: center;
    gap: 0.5em;
}
</style>