import Vue from 'vue';
import Vuex from 'vuex';
import VKC from '@denisnp/vkui-connect-helper';
import {
    getAppId, getPlatform, getUserId,
} from '../utils';

Vue.use(Vuex);

let rateLimitReqs = 0;
setInterval(() => { rateLimitReqs = 0; }, 1000);
async function apiTimeout(method, params, onDone) {
    if (rateLimitReqs >= 3) {
        setTimeout(() => { apiTimeout(method, params, onDone); }, 350);
        return;
    }
    rateLimitReqs++;
    const result = true; // await VKC.api(method, params);

    if (result.error && result.error.error_code === 6) { // too many reqs
        apiTimeout(method, params, onDone);
        return;
    }
    // rateLimitReqs--;
    onDone(result);
}

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
        async loadAllFriends({ commit, dispatch }) {
            commit('setIsLoading', true);
            // console.log();
            // console.log(VKC.api('execute', { key: 'code', value: 'return API.friends.get();' }));
            const friends = await VKC.api('friends.get');
            console.log(friends[0].response.items);

            dispatch('startLoadingFriends', friends[0].response.items);
            // загрузить список друзей пользователя, считая, что права уже даны
            // VKC.api('friends.get', ....)
            // удалить заблокированных и удалённых
            // записать друзей во friends
            // запустить startLoadingFriends
        },
        async startLoadingFriends({ commit }, friends) {
            console.log(friends);
            // const friendsOfFriends = {};
            // friends.forEach(async (id) => {
            //     friendsOfFriends[id] = await VKC.api('friends.get', { user_id: id });
            // });

            const fullResult = [];

            for (let i = 0; i < friends.length; i += 1) {
                apiTimeout('friends.get', {
                    user_id: friends[i],
                    // const friendsOfFriends = apiTimeout('execute', {
                    //     code:`
                    //     var items = {${freinds.slice(i, i + 25).join(',')}};
                    //     var i = 0;
                    //     var result = [];
                    //     while (i < items.length) {
                    //     var f = API.friends.get({user_id: items[i], count: 5000}).items;
                    //     result.push(f);
                    //     i = i + 1;
                    //     }
                    //     return result;
                    //     `
                }, (result) => { fullResult.push(result); console.log('request'); });
            }
            console.log(fullResult); // нельзя await

            // с помощью execute загружать друзей друзей пачками по 10 или сколько позволит execute
            // дописывать каждому другу его айдишники друзей в поле friends

            commit('setIsLoading', false);
        },
    },
});
