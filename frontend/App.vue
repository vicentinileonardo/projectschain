<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import { useAccountStore } from './stores/account.store';
import {useNFTsStore} from "@/stores/nfts.store";
import { onMounted, ref } from 'vue';
import { useToast } from "vue-toastification";
import LoadingSpinner from './components/LoadingSpinner.vue';
import Web3Token from 'web3-token';
import Web3 from 'web3';


const accountStore = useAccountStore();
const nftStore = useNFTsStore();
const toast = useToast();

const error = ref(false);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    await accountStore.setUp();
    await nftStore.setUp();
    toast.success("Connected to MetaMask wallet!");
  } catch (err) {
    console.error("Error in loading account address from MetaMask", err);
    error.value = true;
    toast.error("Error in connecting to MetaMask!");
  }
  loading.value = false;
});

</script>

<template>

  <AppNavbar />

  <div class="routes" v-if="!loading && !error">
    <RouterView />
  </div>

  <LoadingSpinner v-else-if="loading && !error" class="centered" />

  <div class="error" v-else>
    <h2>Error</h2>
    <p>Could not setup account with MetaMask</p>
  </div>
  
</template>

<style scoped>
.routes {
  padding: 0.5em;
}

.error {
  padding: 2.5em;
  color: red;
}

.error h2, p {
  margin: 0;
}
</style>
