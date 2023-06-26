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

onMounted(async () => {
    loading.value = true;
    console.log('Checkout for NFT ' + tokenId);
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

</script>

<template>
    <header class="page-header">
        <h2>Checkout</h2>
        <p>🛒 Complete the operation and buy the project</p>
    </header>

    <div class="info">
        <p><b>Project: </b>{{ toBuy?.name }}</p>
        <p><b>Description: </b>{{ toBuy?.description }}</p>
        <p><b>Author: </b>{{ toBuy?.owner }}</p>
    </div>


    <div class="price">
        <p><b>Base price: </b>{{ buyPrice?.base }}ETH</p>
        <p><b>Royalty price: </b>{{ buyPrice?.royaltyPrice }}ETH</p>
        <hr />
        <p><b>Total: </b>{{ buyPrice?.total }}ETH</p>
    </div>
    <AppButton class="bg-primary centered">
        <Icon icon="formkit:ethereum" />
        <p>Buy project</p>
    </AppButton>
</template>

<style scoped>
.info {
    margin: 1rem 2rem;
}

.price {
    margin: 1rem 2rem;
}
</style>