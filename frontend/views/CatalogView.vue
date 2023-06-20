<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue';
import ProjectInfoModal from "@/components/ProjectInfoModal.vue";
import {ref} from "vue";

const showInfo = ref(false);

function onShowInfo() {
  showInfo.value = true;
}

async function onBuyProject() {

}
</script>

<template>
  <header class="page-header">
    <h2>Projects catalog</h2>
    <p>🛒 Shop for projects</p>
  </header>

  <div class="projects-card-row m2">
    <ProjectCard @info="onShowInfo" />
  </div>

  <ProjectInfoModal v-model:show="showInfo" />
</template>

<style scoped>

</style>