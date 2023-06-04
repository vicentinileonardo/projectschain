<script setup lang="ts">
import { Icon } from '@iconify/vue';
import InfoHeader from '@/components/InfoHeader.vue';
import AppButton from '@/components/AppButton.vue';

</script>

<template>
    <InfoHeader />

    <div class="buttons-row">
        <AppButton class="bg-primary">
            <Icon icon="material-symbols:upload" />
            Upload project
        </AppButton>
        <AppButton class="bg-primary">
            <Icon icon="material-symbols:explore" />
            Explore catalog
        </AppButton>
    </div>
</template>

<style scoped>
.buttons-row {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
}
</style>
