<template>
    <div class="header">Заголовок</div>
</template>

<script>
export default {
    name: 'HeadSelector',
};
</script>

<style scoped>
.header {
    height: 52px;
    /*noinspection CssInvalidFunction*/
    margin-top: calc(0 + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    width: 100%;
    padding-left: 10px;
}
</style>
