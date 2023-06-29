<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from '@iconify/vue';
import AppButton from "@/components/AppButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import type { NFT } from "@/model/nft";
import { useNFTsStore } from "@/stores/nfts.store";
import { useToast } from "vue-toastification";
import { useAccountStore } from "@/stores/account.store";

const nftStore = useNFTsStore();
const toast = useToast();
const accountStore = useAccountStore();

const fileToUpload = ref<File | null>(null);

const uploaded = ref(false);
const loading = ref(false);

const projectNFT = ref<NFT>({
  name: "",
  description: "",
  price: 0,
  royaltyPrice: 0,
  owner: accountStore.getAccount!,
  projectJSON: null,
});

async function onFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    fileToUpload.value = target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", async e => {
      if (reader.result) {
        projectNFT.value.projectJSON = await JSON.parse(reader.result as string);
      }
    })
    reader.readAsText(target.files[0]);
  }
}

function onDeleteFile() {
  projectNFT.value.projectJSON = null;
  fileToUpload.value = null;
}

async function onSubmit() {
  loading.value = true;
  try {
    await nftStore.mintNewProject(projectNFT.value);
    resetUpload();
    toast.success("Project successfully secured as NFT!");
    uploaded.value = true;
  } catch (err) {
    toast.error("Error in uploading project as NFT");
    console.error('Error in minting', err);
  }
  loading.value = false;
}

function resetUpload() {
  // Reset defaults
  uploaded.value = false;
  fileToUpload.value = null;
  projectNFT.value = {
    name: "",
    description: "",
    price: 0,
    royaltyPrice: 0,
    owner: "",
    projectJSON: null,
  }
}

const validSubmit = computed(() => {
  return projectNFT.value.price > 0
    && projectNFT.value.royaltyPrice > 0
    && projectNFT.value.name.length > 0
    && projectNFT.value.description.length > 0
    && projectNFT.value.projectJSON
})
</script>

<template>
  <header class="page-header">
    <h2>Upload a project</h2>
    <p>🔒 Secure the intellectual property of your project on the blockchain:
      upload your project file to add it to your wallet as an NFT.</p>
  </header>

  <div class="m2" v-if="!loading && !uploaded">

    <div class="form-entry">
      <label for="name">Project title:</label>
      <input type="text" id="name" v-model="projectNFT.name" />
    </div>

    <div class="form-entry">
      <label for="description">Project description:</label>
      <textarea id="description" rows="4" v-model="projectNFT.description"></textarea>
    </div>

    <div class="form-entry">
      <label for="price">Project price:</label>
      <input type="number" id="price" v-model="projectNFT.price" />
    </div>

    <div class="form-entry">
      <label for="royalty-price">Project royalty price:</label>
      <input type="number" id="royalty-price" v-model="projectNFT.royaltyPrice" />
    </div>

    <div class="form-entry">
      <label class="file-uploader bg-primary" v-if="!projectNFT.projectJSON">
        <input type="file" accept=".json" @change="onFileUpload" />
        <Icon icon="material-symbols:upload" />
        <span>Select geometries JSON</span>
      </label>
      <div v-if="fileToUpload" class="uploaded-file">
        <Icon icon="mdi:file" />
        <p>{{ fileToUpload.name }}</p>
        <AppButton :round="true" class="bg-danger" @click="onDeleteFile">
          <Icon icon="material-symbols:close" />
        </AppButton>
      </div>
    </div>

    <AppButton class="bg-primary centered" v-if="!loading" :disabled="!validSubmit" @click="onSubmit">
      <Icon icon="material-symbols:save" />
      Save project
    </AppButton>
  </div>

  <div v-else-if="uploaded && !loading" class="completed">
    <h3>Upload successful!</h3>
    <p>Project was secured as NFT to your wallet.</p>
  </div>

  <LoadingSpinner v-else class="centered" />
</template>

<style scoped>
input[type="file"] {
  display: none;
}

.file-uploader {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  border-radius: 0.5em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em;
  font-size: medium;
  cursor: pointer;
}

.file-uploader:hover {
  background-image: linear-gradient(rgb(0 0 0/20%) 0 0);
}

.uploaded-file {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  background-color: #f0f0f0;
  border-radius: 0.5em;
  border: 1px #d0d0d0 solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 0.5em;
  margin-top: 1rem;
}

.uploaded-file p {
  margin: 0.1rem;
}

.upload-result {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  background-color: #f0f0f0;
  border-radius: 0.5em;
  border: 1px #d0d0d0 solid;
  padding: 0.5em 1em;
}

.form-entry {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
}

input,
textarea {
  font-size: medium;
  font-family: 'Lato', sans-serif;
  padding: 0.5rem;
  background-color: #fcfcfc;
  border-radius: 5px;
  border: solid 1px #777;
}

.completed {
  text-align: center;
}
</style>