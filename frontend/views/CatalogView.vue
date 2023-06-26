<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue';
import ProjectInfoModal from "@/components/ProjectInfoModal.vue";
import {onMounted, ref} from "vue";
import type {NFT} from "@/model/nft";
import { useNFTsStore } from '@/stores/nfts.store';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const loading = ref(false);
const projectForInfo = ref<NFT | undefined>(undefined);
const showInfo = ref(false);

const nftsStore = useNFTsStore();

onMounted(async () => {
  loading.value = true;
  try {
    await nftsStore.getCatalogNfts();
  } catch (err) {
    console.error("Error in loading catalog", err);
  }
  loading.value = false;
})

function onShowInfo(project: NFT | undefined) {
  projectForInfo.value = project;
  showInfo.value = true;
}

async function onBuyProject() {

}
</script>

<template>
  <header class="page-header">
    <h2>Projects catalog</h2>
    <p>🛒 Shop for projects.</p>
  </header>

  <div class="projects-card-row m2" v-if="!loading && nftsStore.catalogNfts.length > 0">
    <ProjectCard @info="onShowInfo" 
      v-for="project in nftsStore.catalogNfts" 
      :project="project"
      :key="project.tokenId" />
  </div>

  <div v-else-if="!loading && nftsStore.catalogNfts.length == 0">
    <h4>Catalog is empty.</h4>
  </div>
  
  <LoadingSpinner v-else class="centered"/>

  <ProjectInfoModal :project="projectForInfo" v-model:show="showInfo" />
</template>

<style scoped>
h4 {
  text-align: center;
  font-weight: normal;
}
</style>