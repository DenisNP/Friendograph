<template>
    <div class="f-loader">Загружено {{loadedFriends}} из {{totalFriends}}</div>
</template>

<script>
export default {
    name: 'FriendsLoader',
    computed: {
        totalFriends() {
            return this.$store.getters.totalFriends;
        },
        loadedFriends() {
            return this.$store.state.loadedFriends;
        },
    },
};
</script>

<style scoped>
.f-loader {
    height: 40px;
    display: flex;
    align-items: center;
    font-size: 12px;
    padding-left: 10px;
}
</style>
