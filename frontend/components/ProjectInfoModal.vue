<script setup lang="ts">

import type { NFT } from "@/model/nft";
import { ref, watch } from "vue";
import AppButton from "@/components/AppButton.vue";
import { onClickOutside } from "@vueuse/core";
import { useNFTsStore } from "@/stores/nfts.store";
import { Icon } from '@iconify/vue';

const nftsStore = useNFTsStore();

const props = defineProps<{
  project?: NFT,
  show: boolean
}>();

const emits = defineEmits(['update:show']);

watch(() => props.show, () => {
  if (props.show) {
    modal.value?.showModal();
  }
})

const modal = ref<HTMLDialogElement | null>(null);
const modalContent = ref<HTMLDialogElement | null>(null);

function onCloseModal() {
  modal.value?.close();
  emits('update:show', false);
}

onClickOutside(modalContent, () => {
  modal.value?.close();
  emits('update:show', false);
});

</script>

<template>
  <dialog ref="modal">
    <div ref="modalContent" class="modal-content">
      <h3>Project NFT info</h3>

      <div class="info-element">
        <b>Project title:</b>
        <p>{{ props.project?.name }}</p>
      </div>

      <div class="info-element">
        <b>Project author:</b>
        <p>{{ props.project?.owner }}</p>
      </div>

      <div class="info-element">
        <b>Project description:</b>
        <p>{{ props.project?.description }}</p>
      </div>

      <div class="info-element">
        <b>Project price:</b>
        <p v-if="props.project">
          {{ nftsStore.convertToEth(props.project?.price) }}ETH
        </p>
      </div>

      <div class="info-element">
        <b>Project royalty price:</b>
        <p v-if="props.project">
          {{ nftsStore.convertToEth(props.project?.royaltyPrice) }}ETH
        </p>
      </div>

      <a :href="props.project?.ipfsLink" target="_blank">
        <AppButton class="centered bg-primary my2" v-if="props.project?.ipfsLink">
          <Icon icon="material-symbols:download" />
          <p>IPFS file</p>
        </AppButton>
      </a>

      <AppButton @click="onCloseModal" class="centered">
        Close
      </AppButton>
    </div>

  </dialog>
</template>

<style scoped>
dialog {
  width: 50%;
  border: 0;
  border-radius: 5px;
  padding: 0;
  -webkit-box-shadow: 5px 5px 10px 0px #333;
  -moz-box-shadow: 5px 5px 10px 0px #333;
  -o-box-shadow: 5px 5px 10px 0px #333;
  box-shadow: 5px 5px 10px 0px #333;
}

h3 {
  text-align: center;
  margin: 0.5rem;
}

dialog::backdrop {
  background-color: black;
  opacity: 70%;
}

.modal-content {
  padding: 0.5rem 1rem;
}

.info-element {
  margin: 1rem 0;
}

.info-element b,
p {
  margin: 0
}
</style>