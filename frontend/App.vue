<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';


</script>

<template>

  <AppNavbar />

  <div style="padding: 0.5em;">
    <RouterView />
  </div>
  
</template>

<style scoped>

</style>
