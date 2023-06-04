<script setup lang="ts">
import {onMounted} from "vue";
import {useCounterContract} from "@/stores/counter-contract.store";

const counterContract = useCounterContract();

onMounted(async () => {
  await counterContract.setUp();

  // Test api
  let resp = await fetch('/api');
  let respJson = await resp.json();
  console.log(respJson.msg);
});

</script>

<template>

  <p v-if="counterContract.count">Current count: {{ counterContract.count }}</p>
  <p v-else>Need to load from blockchain...</p>
  <button @click="counterContract.increment()">Increment</button>
  <button @click="counterContract.decrement()">Decrement</button>
  <button @click="counterContract.reset()">Reset</button>

</template>

<style scoped>

</style>