<script setup lang="ts">
import CatalogCard from '@/components/CatalogCard.vue';



async function onBuyProject() {

}
</script>

<template>
    <h2>Projects catalog</h2>
    <p>🛒 Shop for projects</p>

    <div class="projects">
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
    </div>
    

</template>

<style scoped>
.projects {
    margin: 2rem 2rem;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
}
</style>