import Vue from 'vue';
import Vuex from 'vuex';
import VKC from '@denisnp/vkui-connect-helper';
import {
    getAppId, getPlatform, isDev,
} from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        user: {
            id: '463377',
            first_name: 'Денис',
            photo_50: 'https://sun6-23.userapi.com/impg/c858232/v858232066/22664d/mpuOQSQ_mFA.jpg?size=100x0&quality=88&crop=1043,409,1386,1386&sign=9894421bfa8e7908d3401a4dd0abd8ef&c_uniq_tag=BCYyFKW4bObTwD21VNcEheaemu7LqgFhkskHP-LL4Es&ava=1',
        },
        isLoading: false,
        friends: [],
        loadedFriends: 0,
        lastTimeLoaded: 0,
        lastError: '',
    },
    getters: {
        totalFriends(state) {
            return state.friends.length;
        },
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
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
        setLastTimeLoaded(state, time) {
            state.lastTimeLoaded = time;
        },
        updateLoadedFriends(state) {
            state.loadedFriends = state.friends.filter((f) => !!f.friends).length;
        },
    },
    actions: {
        async init({ commit, dispatch }) {
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

            if (!isDev()) {
                const [user] = await VKC.send('VKWebAppGetUserInfo');
                commit('setUser', {
                    ...user,
                    photo_50: user.photo_100,
                });
            }

            // start loading friends
            dispatch('loadAllFriends');
        },
        async loadAllFriends({ state, commit, dispatch }, reload) {
            commit('setIsLoading', true);
            commit('setLastError', '');

            // load stored friends
            if (reload) {
                commit('setLoadedFriends', 0);
                localStorage.setItem('friends', null);
            } else {
                const storedData = localStorage.getItem('friends');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    commit('setLastTimeLoaded', data.time);
                    const storedFriends = data.friends;

                    if (!state.friends || state.friends.length === 0) {
                        commit('setFriends', storedFriends);
                    } else {
                        storedFriends.forEach((sf) => {
                            const friend = state.friends.find((f) => f.id === sf.id);
                            if (friend) {
                                friend.friends = sf.friends;
                            }
                        });
                    }

                    // count if need to add
                    const friendsLoaded = state.friends.filter((f) => !!f.friends);
                    const friendsNotLoaded = state.friends.filter((f) => !f.friends);

                    commit('setFriends', [...friendsLoaded, ...friendsNotLoaded]);
                }
            }

            if (!state.friends || !state.friends.length) {
                const [friends] = await VKC.api('friends.get', { fields: 'photo_50', count: 2500 });
                if (!friends || !friends.response || !friends.response) {
                    commit('setLastError', 'Ошибка при загрузке друзей');
                    commit('setIsLoading', false);
                    return;
                }
                commit('setFriends', friends.response.items.filter((f) => !f.deactivated));
            }

            commit('updateLoadedFriends');

            if (state.loadedFriends < state.friends.length) {
                dispatch('loadMutualFriends');
            } else {
                commit('setIsLoading', false);
            }
        },
        async loadMutualFriends({ state, commit, dispatch }) {
            const fullIds = [];
            for (let i = 0; i < state.friends.length; i += 100) {
                const ids = state.friends.slice(i, i + 100).map((f) => f.id);
                fullIds.push(ids.join(','));
            }

            const code = `
                    var items = ${JSON.stringify(fullIds)};

                    var i = 0;
                    var result = [];
                    while (i < items.length) {
                        var f = API.friends.getMutual({target_uids: items[i]});
                        result.push(f);
                        i = i + 1;
                    }

                    return result;`;

            const [r] = await VKC.api('execute', { code });

            // parse response
            if (!r || !r.response) {
                commit('setIsLoading', false);
                commit('setLastError', 'Ошибка при загрузке друзей друзей');
                return;
            }

            r.response = r.response.flat();
            const fIds = new Set(state.friends.map((f) => f.id));

            // write friends of friends to friends objects
            for (let i = 0; i < r.response.length; i++) {
                const rBlock = r.response[i];
                const friend = state.friends.find((f) => f.id === rBlock.id);
                friend.friends = rBlock.common_friends.filter((f) => fIds.has(f));
            }
            commit('updateLoadedFriends');

            // write friends to localstorage
            dispatch('writeFriends', (new Date()).getTime());

            commit('setIsLoading', false);
        },
        writeFriends({ state, commit }, time) {
            const data = { friends: state.friends, time };
            localStorage.setItem('friends', JSON.stringify(data));
            commit('setLastTimeLoaded', time);
        },
    },
});
