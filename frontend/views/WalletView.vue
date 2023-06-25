<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';
import { Icon } from '@iconify/vue';
import ProjectCard from '@/components/ProjectCard.vue';
import ProjectInfoModal from "@/components/ProjectInfoModal.vue";
import { onMounted, ref } from "vue";
import type { NFT } from "@/model/nft";
import { useNFTsStore } from '@/stores/nfts.store';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const nftsStore = useNFTsStore();

const loading = ref(false);
const projectForInfo = ref<NFT | undefined>(undefined);
const showInfo = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    await nftsStore.getMyNfts();
    await nftsStore.getBoughtNfts();
  } catch (err) {
    console.error("Error in loading wallet NFTs", err);
  }
  loading.value = false;
})

function onShowInfo(project: NFT | undefined) {
  projectForInfo.value = project;
  showInfo.value = true;
}
</script>

<template>
  <header class="page-header">
    <h2>Projects wallet</h2>
    <p>🔐 Manage your projects. Browse the project you have uploaded and bought.</p>
  </header>

  <div class="m2">
    <h3>Your projects</h3>
    <RouterLink to="/upload">
      <AppButton class="bg-primary centered">
        <Icon icon="material-symbols:upload" />
        Upload project
      </AppButton>
    </RouterLink>

    <div class="projects-card-row my2" v-if="!loading && nftsStore.myNfts.length > 0">
      <ProjectCard v-for="project in nftsStore.myNfts" :key="project.tokenId" :hide-buy-button="true"
        @info="onShowInfo" />
    </div>

    <div v-else-if="!loading && nftsStore.myNfts.length == 0">
      <h4>You did not upload any project as NFT.</h4>
    </div>

    <LoadingSpinner v-else class="centered" />
  </div>

  <div class="m2">
    <h3>Purchased projects</h3>
    <div class="projects-card-row my2" v-if="!loading && nftsStore.boughtNfts.length > 0">
      <ProjectCard v-for="project in nftsStore.catalogNfts" :key="project.tokenId" :hide-buy-button="true"
        @info="onShowInfo" />
    </div>

    <div v-else-if="!loading && nftsStore.boughtNfts.length == 0">
      <h4>You did not buy any project NFT.</h4>
    </div>

    <LoadingSpinner v-else class="centered" />
  </div>

  <ProjectInfoModal :project="projectForInfo" v-model:show="showInfo" />
</template>

<style scoped>
h4 {
  text-align: center;
  font-weight: normal;
}
</style>