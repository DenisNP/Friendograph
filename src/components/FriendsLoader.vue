<template>
    <div class="f-loader">
        <div class="spinner" v-if="isLoading"/>
        <i class="fas fa-check-circle icon" v-if="isLoaded"/>
        <i class="fas fa-times-circle icon" v-if="isError"/>
        <span class="text">{{text}}</span>
        <div class="reload-btn" v-if="!isLoading" @click="reload">Обновить</div>
    </div>
</template>

<script>
import { getNumericPhrase, numericPhraseWithText } from '@/utils';

export default {
    name: 'FriendsLoader',
    computed: {
        totalFriends() {
            return this.$store.getters.totalFriends;
        },
        loadedFriends() {
            return this.$store.state.loadedFriends;
        },
        isLoading() {
            return this.$store.state.isLoading || !this.totalFriends;
        },
        isError() {
            return !!this.$store.state.lastError && !this.isLoading;
        },
        isLoaded() {
            return !this.isError && !this.isLoading;
        },
        text() {
            if (this.isError) {
                return this.$store.state.lastError;
            } if (!this.totalFriends) {
                return 'Загружаю друзей...';
            }

            const prefix = getNumericPhrase(this.loadedFriends, 'Загружен', 'Загружено', 'Загружено');
            const friends = numericPhraseWithText(this.loadedFriends, 'друг', 'друга', 'друзей');
            const fullPhrase = `${prefix} ${friends} из ${this.totalFriends}`;

            if (this.isLoading) {
                return `${fullPhrase}...`;
            }

            if (this.$store.state.lastTimeLoaded) {
                const diff = (new Date()).getTime() - this.$store.state.lastTimeLoaded;
                const days = Math.floor((diff / (3600000 * 24)));

                if (days > 0) {
                    const daysText = numericPhraseWithText(days, 'день', 'дня', 'дней');
                    return `${prefix} ${friends} ${daysText} назад`;
                }
            }
            return `${prefix} ${friends}`;
        },
    },
    methods: {
        reload() {
            this.$store.dispatch('loadAllFriends', true);
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
    background-color: rgba(255, 255, 255, 0.1);
}

.spinner {
    margin: 100px auto;
    font-size: 25px;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    position: absolute;
    text-indent: -9999em;
    animation: load5 1.1s infinite ease;
    transform: translateZ(0) scale(0.1);
}

.icon {
    position: absolute;
    margin-left: 7px;
    font-size: 14px;
}

.text {
    margin-left: 28px;
}

.reload-btn {
    margin-left: auto;
    margin-right: 10px;
    border: 1px solid #e1e3e6;
    border-radius: 5px;
    padding: 5px 9px;
    cursor: pointer;
}

.reload-btn:active {
    background-color: rgba(255, 255, 255, 0.05);
}

@-webkit-keyframes load5 {
    0%,
    100% {
        box-shadow: 0 -2.6em 0 0 #ffffff, 1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
        2.5em 0 0 0 rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
        0 2.5em 0 0 rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
        -2.6em 0 0 0 rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7);
    }
    12.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0 #ffffff,
        2.5em 0 0 0 rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
        0 2.5em 0 0 rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
        -2.6em 0 0 0 rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5);
    }
    25% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.5),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7), 2.5em 0 0 0 #ffffff,
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    37.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5), 2.5em 0 0 0 rgba(255, 255, 255, 0.7),
        1.75em 1.75em 0 0 #ffffff, 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    50% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.5),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.7), 0 2.5em 0 0 #ffffff,
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    62.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.5), 0 2.5em 0 0 rgba(255, 255, 255, 0.7),
        -1.8em 1.8em 0 0 #ffffff, -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    75% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.5),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.7), -2.6em 0 0 0 #ffffff,
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    87.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.5), -2.6em 0 0 0 rgba(255, 255, 255, 0.7),
        -1.8em -1.8em 0 0 #ffffff;
    }
}
@keyframes load5 {
    0%,
    100% {
        box-shadow: 0 -2.6em 0 0 #ffffff, 1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
        2.5em 0 0 0 rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
        0 2.5em 0 0 rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
        -2.6em 0 0 0 rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7);
    }
    12.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0 #ffffff,
        2.5em 0 0 0 rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
        0 2.5em 0 0 rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
        -2.6em 0 0 0 rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5);
    }
    25% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.5),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7), 2.5em 0 0 0 #ffffff,
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    37.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5), 2.5em 0 0 0 rgba(255, 255, 255, 0.7),
        1.75em 1.75em 0 0 #ffffff, 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    50% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.5),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.7), 0 2.5em 0 0 #ffffff,
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2), -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    62.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.5), 0 2.5em 0 0 rgba(255, 255, 255, 0.7),
        -1.8em 1.8em 0 0 #ffffff, -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    75% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.5),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.7), -2.6em 0 0 0 #ffffff,
        -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
    }
    87.5% {
        box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2), 2.5em 0 0 0 rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2), 0 2.5em 0 0 rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.5), -2.6em 0 0 0 rgba(255, 255, 255, 0.7),
        -1.8em -1.8em 0 0 #ffffff;
    }
}
</style>
