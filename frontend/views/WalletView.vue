<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';
import {Icon} from '@iconify/vue';
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
</script>

<template>
  <header class="page-header">
    <h2>Projects wallet</h2>
    <p>🔐 Manage your projects. Browse the project you have uploaded and bought.</p>
  </header>

  <div class="m2">
    <h3>Your projects</h3>
    <RouterLink to="/upload">
      <AppButton class="bg-primary">
        <Icon icon="material-symbols:upload"/>
        Upload project
      </AppButton>
    </RouterLink>
    <div class="projects-card-row my2">
      <ProjectCard :hide-buy-button="true" @info="onShowInfo"/>
    </div>
  </div>

  <div class="m2">
    <h3>Purchased projects</h3>
    <div class="projects-card-row my2">
      <ProjectCard :hide-buy-button="true" @info="onShowInfo"/>
    </div>
  </div>

  <ProjectInfoModal :project="projectForInfo" v-model:show="showInfo"/>
</template>

<style scoped></style>