<script setup lang="ts">
import {RouterLink} from 'vue-router';
import {useAccountStore} from "@/stores/account.store";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const accountStore = useAccountStore();
</script>

<template>
  <nav class="navbar bg-primary">
    <RouterLink class="navbar-logo" to="/">
      <img src="@/assets/blockchain.png" alt="Logo" height="36">
      <span>ProjectsChain</span>
    </RouterLink>

    <div v-if="accountStore">
      <p>Logged in as:</p>
      <b>{{ accountStore.getAccount }}</b>
    </div>

  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.navbar p, b {
  margin: 0;
  font-size: x-small;
}

.navbar p {
  font-weight: lighter;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
</style>