import Vue from 'vue';
import Vuex from 'vuex';
import VKC from '@denisnp/vkui-connect-helper';
import {
    getAppId, getPlatform, getUserId,
} from '../utils';

Vue.use(Vuex);

const requestDelay = 500;
const friendsChunkSize = 25;

export default new Vuex.Store({
    state: {
        userId: '463377',
        isLoading: false,
        friends: [],
        loadedFriends: 0,
        lastTimeLoaded: 0,
        lastIndexToLoad: 0,
        lastError: '',
    },
    getters: {
        totalFriends(state) {
            return state.friends.length;
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
        setLastError(state, error) {
            state.lastError = error;
        },
        setLastIndexToLoad(state, idx) {
            state.lastIndexToLoad = idx;
        },
        setLastTimeLoaded(state, time) {
            state.lastTimeLoaded = time;
        },
        updateLoadedFriends(state) {
            state.loadedFriends = state.friends.filter((f) => !!f.friends).length;
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
        async loadAllFriends({ state, commit, dispatch }) {
            commit('setIsLoading', true);
            commit('setLastError', '');
            const [friends] = await VKC.api('friends.get', { fields: 'photo_50', count: 5000 });
            if (!friends || !friends.response || !friends.response) {
                commit('setLastError', 'Ошибка при загрузке друзей');
                return;
            }

            commit('setFriends', friends.response.items.filter((f) => !f.deactivated));

            // set start index to load chunks
            let startFrom = 0;

            // load stored friends
            const storedData = localStorage.getItem('friends');
            if (storedData) {
                const data = JSON.parse(storedData);
                commit('setLastTimeLoaded', data.time);
                const storedFriends = data.friends;
                storedFriends.forEach((sf) => {
                    const friend = state.friends.find((f) => f.id === sf.id);
                    if (friend) {
                        friend.friends = sf.friends;
                    }
                });

                // count if need to add
                const friendsLoaded = state.friends.filter((f) => !!f.friends);
                const friendsNotLoaded = state.friends.filter((f) => !f.friends);

                commit('setFriends', [...friendsLoaded, ...friendsNotLoaded]);
                commit('updateLoadedFriends');
                startFrom = friendsLoaded.length;
            }

            dispatch('loadNextChunk', startFrom);
        },
        async loadNextChunk({ state, commit, dispatch }, startFrom) {
            if (startFrom !== -1) commit('setLastIndexToLoad', startFrom);

            if (state.lastIndexToLoad < state.friends.length) {
                // load next chunk
                const chunk = state.friends.slice(
                    state.lastIndexToLoad,
                    state.lastIndexToLoad + friendsChunkSize,
                );

                const ids = chunk.map((f) => f.id);

                const code = `
                    var items = [${ids.join(',')}];

                    var i = 0;
                    var result = [];
                    while (i < items.length) {
                        var f = API.friends.get({user_id: items[i], count: 3000}).items;
                        result.push(f);
                        i = i + 1;
                    }

                    return result;`;

                const requestStartTime = (new Date()).getTime();
                const [r] = await VKC.api('execute', { code });
                const requestEndTime = (new Date()).getTime();

                // parse response
                if (!r || !r.response || r.response.length !== ids.length) {
                    commit('setIsLoading', false);
                    commit('setLastError', 'Ошибка при загрузке друзей друзей');
                    return;
                }

                // write friends of friends to friends objects
                for (let i = 0; i < r.response.length; i++) {
                    const friend = state.friends.find((f) => f.id === ids[i]);
                    friend.friends = r.response[i];
                }
                commit('updateLoadedFriends');

                // write friends to localstorage
                dispatch('writeFriends', 0);

                // load next chunk
                state.lastIndexToLoad -= -friendsChunkSize;
                const delay = Math.max(1, requestDelay - (requestEndTime - requestStartTime));
                setTimeout(() => {
                    dispatch('loadNextChunk', -1);
                }, delay);
            } else {
                commit('setIsLoading', false);
            }
        },
        writeFriends({ state, commit }, time) {
            const data = { friends: state.friends, time };
            localStorage.setItem('friends', JSON.stringify(data));
            commit('setLastTimeLoaded', time);
        },
    },
});
