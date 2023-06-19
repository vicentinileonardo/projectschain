<template>
    <div class="card">
        <slot>

        </slot>
    </div>
</template>

<style scoped>
.card {
    width: fit-content;
    padding: 0.5em 1.5em;
    background-color: #fff;
    border: #f3f3f3;
    border-radius: 5px;
    -webkit-box-shadow: 5px 5px 10px 0px #7E7E7E;
    -moz-box-shadow: 5px 5px 10px 0px #7E7E7E;
    -o-box-shadow: 5px 5px 10px 0px #7E7E7E;
    box-shadow: 5px 5px 10px 0px #7E7E7E;
}
</style>