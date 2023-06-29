<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { NFT } from "@/model/nft";
import { useNFTsStore } from '@/stores/nfts.store';
import type { BuyPrice } from '@/stores/nfts.store';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/AppButton.vue';
import { Icon } from '@iconify/vue';

const route = useRoute();
const tokenId = parseInt(route.params.tokenId as string);

const nftsStore = useNFTsStore();

const loading = ref(false);
const toBuy = ref<NFT | null>(null);
const buyPrice = ref<BuyPrice | null>(null);
const buying = ref(false);

onMounted(async () => {
    loading.value = true;
    try {
        await nftsStore.getCatalogNfts();
        toBuy.value = nftsStore.catalogNfts.find(nft => nft.tokenId === tokenId)!;
        buyPrice.value = await nftsStore.getBuyPrice(tokenId);
        buyPrice.value.total = buyPrice.value.base + buyPrice.value.royaltyPrice;
    } catch (err) {
        console.error(err);
    }
    loading.value = false;
});

async function onBuy() {
    buying.value = true;
    try {
        await nftsStore.buyProject(toBuy.value!, buyPrice.value?.total!);
    } catch(err) {
        console.error(err);
    }
    buying.value = false;
}

</script>

<template>
    <header class="page-header">
        <h2>Checkout</h2>
        <p>🛒 Complete the operation and buy the project.</p>
    </header>

    <div v-if="!loading">
        <div class="info">
            <p><b>Project: </b>{{ toBuy?.name }}</p>
            <p><b>Description: </b>{{ toBuy?.description }}</p>
            <p><b>Author: </b>{{ toBuy?.owner }}</p>
        </div>

        <div class="price">
            <p>Price to pay for project: it includes the base price of the project 
                plus the roaylties of its components (if any) 
                and a 5% commission fee for the platform.</p>
            <p><b>Base price: </b>{{ buyPrice?.base }}ETH</p>
            <p><b>Royalty price: </b>{{ buyPrice?.royaltyPrice }}ETH</p>
            <hr />
            <p><b>Total: </b>{{ buyPrice?.total }}ETH</p>
        </div>

        <AppButton class="bg-primary centered" v-if="!buying" @click="onBuy">
            <Icon icon="formkit:ethereum" />
            <p>Buy project</p>
        </AppButton>
        <LoadingSpinner class="centered" v-else />
    </div>

    <LoadingSpinner class="centered" v-else />
</template>

<style scoped>
.info {
    margin: 1rem 2rem;
}

.price {
    margin: 1rem 2rem;
}
</style>