<script setup lang="ts">
import type { NFT } from '@/model/nft';
import { Icon } from '@iconify/vue';
import AppCard from './AppCard.vue';
import AppButton from './AppButton.vue';
import { URL } from 'url';


const props = defineProps<{
  project?: NFT
}>();


const emits = defineEmits([
  'buy'
]);

</script>

<template>
  <AppCard>
    <div class="card-image-container">
      <img src="../assets/project1.jpg" class="card-image"/>
    </div>

    <div class="card-title">
      <h4>Projects title</h4>
      <p>Project's author</p>
    </div>

    <div class="card-buttons">
      <AppButton @click="emits('buy')" class="centered">
        <Icon icon="material-symbols:shopping-cart" />
        Buy
      </AppButton>
    </div>
  </AppCard>
</template>

<style scoped>

.card {
  flex-basis: 15%;
}

.card-image {
  border-radius: 5px;
  width: 200px;
  height: auto;
}

.card-title {
  text-align: center;
  margin: 1rem 0;
}

.card-title h4, p {
  margin: 0;
}

.card-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
}
</style>