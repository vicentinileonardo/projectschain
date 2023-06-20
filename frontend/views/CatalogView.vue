<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue';
import ProjectInfoModal from "@/components/ProjectInfoModal.vue";
import {ref} from "vue";
import {NFT} from "@/model/nft";

const projectForInfo = ref<NFT | undefined>(undefined);
const showInfo = ref(false);

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

  <div class="projects-card-row m2">
    <ProjectCard @info="onShowInfo" />
  </div>

  <ProjectInfoModal :project="projectForInfo" v-model:show="showInfo" />
</template>

<style scoped>

</style>