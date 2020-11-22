<template>
    <div id="app">
        <head-selector/>
        <friends-loader/>
    </div>
</template>

<script>
import FriendsLoader from '@/components/FriendsLoader.vue';
import HeadSelector from '@/components/HeadSelector.vue';

export default {
    name: 'App',
    components: { HeadSelector, FriendsLoader },
    mounted() {
        this.$store.dispatch('init');
    },
};
</script>

<style>
body {
    -webkit-user-select: none;
    user-select: none;
    overscroll-behavior-y: none;
    font-family: Avenir, Helvetica, Arial, sans-serif;
}
* {
    box-sizing: border-box;
    color: #e1e3e6;
}
a, a:active, a:focus{
    outline: none!important;
}
html,
body {
    position: fixed;
    overflow: hidden;
    background-color: #19191a;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
}
</style>
