<script setup lang="ts">
import {ref} from "vue";
import { Icon } from '@iconify/vue';
import AppButton from "@/components/AppButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {onMounted} from "vue";
import {useMasterContract} from "@/stores/master-contract.store";

const masterContract = useMasterContract();

onMounted(async () => {
  await masterContract.setUp();
});


const fileToUpload = ref<File | null>(null);
const uploadedPath = ref('');
const priceInput = ref<HTMLInputElement | null>(null);
var priceValue:number=-1;

const uploaded = ref(false);
const loading = ref(false);

function setPrice() {
  const price:any = priceInput.value?.value;
  if (price == undefined) {
    priceValue=-1;
  }else{
    priceValue=parseFloat(price);
  }
  console.log(priceValue);
}


function onFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    fileToUpload.value = target.files[0];
  }
}

function onDeleteFile() {
  fileToUpload.value = null;
}

async function uploadToIPFS() {
  loading.value = true;
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
          onResetUpload();
      }else{
          uploadedPath.value = res.url;
          uploaded.value = true;
          masterContract.mintToken(res.url, priceValue);
      }
      
  }
  loading.value = false;
}

function onResetUpload() {
  uploaded.value = false;
  fileToUpload.value = null;
}
</script>

<template>
  <header>
    <h2>Upload a project</h2>
    <p>🔒 Secure the intellectual property of your project on the blockchain.</p>
    <p>Upload your project file to add it to your wallet as an NFT.</p>
  </header>

  <div class="my2" v-if="!loading && !uploaded">
    <label class="file-uploader bg-primary">
      <input type="file" accept=".json" @change="onFileUpload"/>
      <Icon icon="material-symbols:upload" />
      <span>Select JSON</span>
    </label>
    <div v-if="fileToUpload" class="uploaded-file">
      <Icon icon="mdi:file" />
      <span>{{ fileToUpload.name }}</span>
      <AppButton :round="true" class="bg-danger" @click="onDeleteFile">
        <Icon icon="material-symbols:close" />
      </AppButton>
    </div>
    <br>
    <div v-if="fileToUpload" style="text-align: center;" >
      <label for="price">Price for buyers: </label>
      <input type="number" id="price" size="5" ref="priceInput" @change="setPrice()">
    </div>

  </div>

  <AppButton @click="uploadToIPFS()" v-if="fileToUpload && !loading && !uploaded" class="bg-primary centered">
    <span>Upload</span>
  </AppButton>

  <LoadingSpinner v-if="loading" class="centered" />

  <div v-if="uploaded" class="upload-result">{{ uploadedPath }}</div>

  <AppButton class="bg-primary centered my2" v-if="uploaded" @click="onResetUpload">
    <span>Upload another project</span>
  </AppButton>
</template>

<style scoped>
header {
  margin: 1em;
}

header > h2 {
  margin: 0;
}

header > p {
  margin-top: 0.5em;
}

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
  margin-top: 1em;
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
</style>