<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useCounterContract } from './stores/counter-contract.store';

const counterContract = useCounterContract();

onMounted(async () => {
  await counterContract.setUp();
})

</script>

<template>
  
  <p v-if="counterContract.count">Current count: {{ counterContract.count }}</p>
  <p v-else>Need to load from blockchain...</p>
  <button @click="counterContract.increment()">Increment</button>
  <button @click="counterContract.decrement()">Decrement</button>
  <button @click="counterContract.reset()">Reset</button>

  <RouterView />
</template>

<style scoped>

</style>
