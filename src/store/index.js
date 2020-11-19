import Vue from 'vue';
import Vuex from 'vuex';
import VKC from '@denisnp/vkui-connect-helper';
import {
    getAppId, getPlatform, getUserId,
} from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userId: '463377',
        isLoading: false,
        friends: [],
    },
    getters: {
        totalFriends(state) {
            return state.friends.length;
        },
        loadedFriends(state) {
            return state.friends.filter((f) => !!f.friends).length;
        },
    },
    mutations: {
        setUserId(state, userId) {
            state.userId = userId;
        },
        setFriends(state, friends) {
            state.friends = friends;
        },
        setIsLoading(state, isLoading) {
            state.isLoading = isLoading;
        },
        setTotalFriends(state, totalFriends) {
            state.totalFriends = totalFriends;
        },
        setLoadedFriends(state, loadedFriends) {
            state.loadedFriends = loadedFriends;
        },
    },
    actions: {
        init({ commit, dispatch }) {
            VKC.init({
                appId: getAppId(),
                accessToken: getPlatform() === 'local' ? process.env.VUE_APP_VK_DEV_TOKEN : '',
                asyncStyle: true,
                apiVersion: '5.126',
            });

            // set bar color
            VKC.bridge().send(
                'VKWebAppSetViewSettings',
                { status_bar_style: 'dark', action_bar_color: '#ffffff' },
            );

            commit('setUserId', getUserId());

            // start loading friends
            dispatch('loadAllFriends');
        },
        async loadAllFriends({ commit }) {
            commit('setIsLoading', true);
            // загрузить список друзей пользователя, считая, что права уже даны
            // VKC.api('friends.get', ....)
            // удалить заблокированных и удалённых
            // записать друзей во friends
            // запустить startLoadingFriends
        },
        async startLoadingFriends({ commit }) {
            // с помощью execute загружать друзей друзей пачками по 10 или сколько позволит execute
            // дописывать каждому другу его айдишники друзей в поле friends

            commit('setIsLoading', false);
        },
    },
});
