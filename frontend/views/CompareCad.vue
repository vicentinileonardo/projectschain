<script setup lang="ts">
import {ref} from "vue";
import AppButton from "@/components/AppButton.vue";

const fileToUpload1 = ref<File | null>(null);
const fileToUpload2 = ref<File | null>(null);

function onFileUpload1(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    fileToUpload1.value = target.files[0];
  }
}
function onFileUpload2(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    fileToUpload2.value = target.files[0];
  }
}

async function compareProjects() {
  if(!fileToUpload1.value || !fileToUpload2.value){
      alert("No all files selected");
  } else {
      const formData = new FormData();
      formData.append("files", fileToUpload1.value);
      formData.append("files", fileToUpload2.value);
      console.log(formData);
      let res = await fetch("http://127.0.0.1:3000/api/compareProjects", {
          method: 'POST',
          body: formData,
      });
      res = await res.json();
      res = JSON.parse(res)
      //console.log(res);
      alert(res.message);
  }
}

</script>

<template>
  <header>
    <h2>Component Checker</h2>
  </header>

  <div class="my2">
    <label class="file-uploader bg-primary">
      <input type="file" accept=".json"  @change="onFileUpload1"/>
      <Icon icon="material-symbols:upload" />
      <span>Select JSON 1</span>
    </label>
    <br>
    <label class="file-uploader bg-primary">
      <input type="file" accept=".json"  @change="onFileUpload2"/>
      <Icon icon="material-symbols:upload" />
      <span>Select JSON 2</span>
    </label>
  </div>

  <AppButton @click="compareProjects()" class="bg-primary centered">
    <span>Check</span>
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