<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import { useAccountStore } from './stores/account.store';
import { onMounted } from 'vue';
import { useToast } from "vue-toastification";

const accountStore = useAccountStore();
const toast = useToast();

onMounted(async () => {
  try {
    await accountStore.setUp();
    toast.success("Connected to MetaMask wallet!");
  } catch (err) {
    console.error("Error in loading account address from MetaMask", err);
    toast.error("Error in connecting to MetaMask!");
  }
});

</script>

<template>

  <AppNavbar />

  <div style="padding: 0.5em;">
    <RouterView />
  </div>
  
</template>

<style scoped>

</style>
