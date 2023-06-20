<script setup lang="ts">

import {NFT} from "@/model/nft";
import {ref, watch} from "vue";
import AppButton from "@/components/AppButton.vue";
import {onClickOutside} from "@vueuse/core";

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
      <h4>Project NFT info</h4>

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

h4 {
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
</style>