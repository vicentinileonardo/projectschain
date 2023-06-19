<script setup lang="ts">
import { Icon } from '@iconify/vue';
import InfoHeader from '@/components/InfoHeader.vue';
import AppButton from '@/components/AppButton.vue';

</script>

<template>
    <InfoHeader />

    <div class="buttons-row">
        <RouterLink to="/wallet">
            <AppButton class="bg-primary">
                <Icon icon="ic:baseline-wallet" />
                Manage wallet
            </AppButton>
        </RouterLink>

        <RouterLink to="/catalog">
            <AppButton class="bg-primary">
                <Icon icon="material-symbols:explore" />
                Explore catalog
            </AppButton>
        </RouterLink>
    </div>
</template>

<style scoped>
.buttons-row {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
}
</style>
