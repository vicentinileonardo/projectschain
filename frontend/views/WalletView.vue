<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';
import { Icon } from '@iconify/vue';
import ProjectCard from '@/components/ProjectCard.vue';
</script>

<template>
    <header class="page-header">
        <h2>Projects wallet</h2>
        <p>🔐 Manage your projects</p>
    </header>

    <h3>Your projects</h3>
    <RouterLink to="/upload">
        <AppButton class="bg-primary">
            <Icon icon="material-symbols:upload" />
            Upload project
        </AppButton>
    </RouterLink>
    <div class="projects-card-row">
        <ProjectCard :hide-buy-button="true" />
        <ProjectCard :hide-buy-button="true" />
    </div>

    <h3>Purchased projects</h3>
    <div class="projects-card-row">
        <ProjectCard :hide-buy-button="true" />
        <ProjectCard :hide-buy-button="true" />
        <ProjectCard :hide-buy-button="true" />
    </div>
</template>

<style scoped></style>