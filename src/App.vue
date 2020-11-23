<template>
    <div id="app">
        <head-selector/>
        <friends-loader/>
        <div class="graph">
            <full-clusters class="graph-inside"/>
        </div>
    </div>
</template>

<script>
import FriendsLoader from '@/components/FriendsLoader.vue';
import HeadSelector from '@/components/HeadSelector.vue';
import FullClusters from '@/graphs/FullClusters.vue';

export default {
    name: 'App',
    components: { FullClusters, HeadSelector, FriendsLoader },
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
    background-color: #3a2e4a;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
}

#app {
    position: relative;
    width: 100%;
    height: 100%;
}

.graph {
    position: relative;
    height: 100%;
}

.graph-inside {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
</style>
