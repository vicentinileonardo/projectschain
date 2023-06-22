<script setup lang="ts">
const props = defineProps<{
  round?: boolean;
}>()
</script>

<template>
    <button class="button" :class="{'rounded': props.round}">
        <slot>

        </slot>
    </button>
</template>

<style scoped>
.button {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em;
    border: none;
    border-radius: 0.5em;
}

.button:hover:enabled {
    background-image: linear-gradient(rgb(0 0 0/20%) 0 0);
}

.button:disabled {
  background-color: #a6a6a6;
}

.rounded {
  padding: 0.1em;
  border-radius: 100%;
}
</style>