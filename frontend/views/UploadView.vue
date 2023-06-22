<script setup lang="ts">
import {computed, ref} from "vue";
import { Icon } from '@iconify/vue';
import AppButton from "@/components/AppButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import type { NFT } from "@/model/nft";
import {useNFTsStore} from "@/stores/nfts.store";

const nftStore = useNFTsStore();

const fileToUpload = ref<File | null>(null);
const uploadedPath = ref('');

const uploaded = ref(false);
const loading = ref(false);

const projectNFT = ref<NFT>({
  name: "",
  description: "",
  price: 0,
  royaltyPrice: 0,
  owner: "",
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
  // TODO fix for upload to contract and backend
  loading.value = true;
  try {
    nftStore.mintNewProject(projectNFT.value);
  } catch(err) {
    console.error('Error in uploading project', err);
  }

  /*
  if(!fileToUpload.value){
      alert("No files selected");
  } else {
      const formData = new FormData();
      formData.append("file", fileToUpload.value);
      let res = await fetch("http://127.0.0.1:3000/api/uploadIPFS", {
          method: 'POST',
          body: formData,
      });
      res = await res.json();
      res = JSON.parse(res)
      //console.log(res);
      if(res.status=="FAIL"){
          alert(res.message);
          resetUpload();
      }else{
          uploadedPath.value = res.url;
          uploaded.value = true;
      }
      
  }
  */
  // resetUpload();
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
        <input type="file" accept=".json" @change="onFileUpload"/>
        <Icon icon="material-symbols:upload" />
        <span>Select geometries JSON</span>
      </label>
      <div v-if="fileToUpload" class="uploaded-file">
        <Icon icon="mdi:file" />
        <span>{{ fileToUpload.name }}</span>
        <AppButton :round="true" class="bg-danger" @click="onDeleteFile">
          <Icon icon="material-symbols:close" />
        </AppButton>
      </div>
    </div>
  </div>

  <AppButton class="bg-primary centered" :disabled="!validSubmit && !loading" @click="onSubmit">
    <Icon icon="material-symbols:save" />
    Save project
  </AppButton>

  <LoadingSpinner v-if="loading" class="centered" />

  <div v-if="uploaded" class="upload-result">{{ uploadedPath }}</div>
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
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1em;
  margin-top: 1rem;
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

input, textarea {
  padding: 0.5rem;
  background-color: #fcfcfc;
  border-radius: 5px;
  border: solid 1px #777;
}
</style>