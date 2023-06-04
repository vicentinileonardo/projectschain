<script setup lang="ts">
</script>

<template>
    <button class="button">
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

.button:hover {
    background-image: linear-gradient(rgb(0 0 0/20%) 0 0);
}
</style>