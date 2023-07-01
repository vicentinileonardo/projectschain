<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { NFT } from "@/model/nft";
import { useNFTsStore } from '@/stores/nfts.store';
import type { BuyPrice } from '@/stores/nfts.store';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/AppButton.vue';
import { Icon } from '@iconify/vue';
import { useToast } from "vue-toastification";

const route = useRoute();
const tokenId = parseInt(route.params.tokenId as string);

const nftsStore = useNFTsStore();
const toast = useToast();

const loading = ref(false);
const toBuy = ref<NFT | null>(null);
const buyPrice = ref<BuyPrice | null>(null);
const buying = ref(false);
const completed = ref(false);

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
        toast.success("Checkout complete, project bought!");
        completed.value = true;
    } catch(err) {
        toast.error("Error in buying the project NFT");
        console.error('Error in buying the project', err);
    }
    buying.value = false;
}

</script>

<template>
    <header class="page-header">
        <h2>Checkout</h2>
        <p>🛒 Complete the operation and buy the project.</p>
    </header>

    <div v-if="!loading && !completed">
        <div class="info">
            <p><b>Project: </b>{{ toBuy?.name }}</p>
            <p><b>Description: </b>{{ toBuy?.description }}</p>
            <p><b>Author: </b>{{ toBuy?.owner }}</p>
        </div>

        <div class="price">
            <p>Price to pay for project: it includes the base price of the project 
                plus the royalties of its components (if any). 
                For both costs, a 5% commission fee is included for the platform.</p>
            <p v-if="buyPrice"><b>Base price: </b>{{ nftsStore.convertToEth(buyPrice?.base) }}ETH</p>
            <p v-if="buyPrice"><b>Royalty price: </b>{{ nftsStore.convertToEth(buyPrice?.royaltyPrice) }}ETH</p>
            <hr />
            <p v-if="buyPrice"><b>Total: </b>{{ nftsStore.convertToEth(buyPrice?.total) }}ETH</p>
        </div>

        <AppButton class="bg-primary centered" v-if="!buying" @click="onBuy">
            <Icon icon="formkit:ethereum" />
            <p>Buy project</p>
        </AppButton>
        <LoadingSpinner class="centered" v-else />
    </div>

    <div v-else-if="!loading && completed" class="completed">
        <h3>Transaction completed!</h3>
        <p>Bought project NFT is added to your wallet.</p>
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

.completed {
    text-align: center;
}
</style>