<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import Web3 from 'web3';
import contractABI from '../build/contracts/Counter.json';

// To change whenever contract is deployed...
const contractAddress = '0x3c2584567356F0e12A18BDA0F5DE794aa9277077';

let web3;
let account: string;
let counterContract;

const count = ref<number | null>(null);

// Setup web3
onMounted(async () => {
  await window.ethereum.request({method: 'eth_requestAccounts'});
  web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  counterContract = new web3.eth.Contract(contractABI.abi, contractAddress);
  const result = await counterContract.methods.getCount().call({from: account});
  count.value = result;
});

async function increment() {
  await counterContract.methods.incrementCounter().send({from: account});
  const result = await counterContract.methods.getCount().call({from: account});
  count.value = result;
}

async function decrement() {
  await counterContract.methods.decrementCounter().send({from: account});
  const result = await counterContract.methods.getCount().call({from: account});
  count.value = result;
}

async function reset() {
  await counterContract.methods.reset().send({from: account});
  const result = await counterContract.methods.getCount().call({from: account});
  count.value = result;
}

</script>

<template>
  
  <p v-if="count">Current count: {{ count }}</p>
  <p v-else>Need to load from blockchain...</p>
  <button @click="increment">Increment</button>
  <button @click="decrement">Decrement</button>
  <button @click="reset">Reset</button>

  <RouterView />
</template>

<style scoped>

</style>
