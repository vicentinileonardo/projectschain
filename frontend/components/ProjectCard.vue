<script setup lang="ts">
import type { NFT } from '@/model/nft';
import { Icon } from '@iconify/vue';
import AppButton from './AppButton.vue';


const props = defineProps<{
  project?: NFT
  hideBuyButton?: boolean;
}>();


const emits = defineEmits([
  'buy'
]);

</script>

<template>
  <div class="card">
    <div class="card-image-container">
      <img src="../assets/project1.jpg" class="card-image"/>
    </div>

    <div class="card-title">
      <h4>Projects title</h4>
      <p>Project's author</p>
    </div>

    <div class="card-buttons">
      <AppButton @click="emits('buy')" class="centered" v-if="!props.hideBuyButton">
        <Icon icon="material-symbols:shopping-cart" />
        Buy
      </AppButton>
    </div>
  </div>
</template>

<style scoped>

.card {
    width: fit-content;
    padding: 0.5em 1.5em;
    background-color: #fff;
    border: #f3f3f3;
    border-radius: 5px;
    flex-basis: 15%;
    -webkit-box-shadow: 5px 5px 10px 0px #7E7E7E;
    -moz-box-shadow: 5px 5px 10px 0px #7E7E7E;
    -o-box-shadow: 5px 5px 10px 0px #7E7E7E;
    box-shadow: 5px 5px 10px 0px #7E7E7E;
}

.card-image {
  border-radius: 5px;
  width: 200px;
  height: auto;
  display: block;
  margin-left: auto;
  margin-right: auto;
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