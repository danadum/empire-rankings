const app = Vue.createApp({
    data() {
        return {
            proxy: "https://sheltered-everglades-24913.fly.dev/",
            languages: [],
            servers: {},
            events: {},
            texts: {},
            players: [],
            current_language: 'fr',
            current_server_header: 'EmpireEx_3',
            current_event_name: '',
            current_category_index: 0,
            current_search: 1,
            last_rank: 1,
            alliance_ranking: false
        }
    },

    async mounted() {
        await this.getLanguages();
        await this.changeLanguage();

        let sockets_file = await fetch(`${this.proxy}https://empire-html5.goodgamestudios.com/config/network/1.xml`);
        sockets_file = new DOMParser().parseFromString(await sockets_file.text(), 'text/xml');
        for (let instance of sockets_file.firstChild.firstChild.children) {
            if (instance.children[2].textContent != "EmpireEx_23") {
                this.servers[instance.children[2].textContent] = {
                    name: instance.children[6].textContent,
                    id: instance.children[4].textContent
                };
            }
        }

        const response = await fetch("events.json");
        this.events = await response.json();
        this.current_event_name = Object.keys(this.eventsList)[0];
        await this.getRankingsByRank();
    },

    template:
    /*html*/
    `
    <section :style="{direction: this.current_language == 'ar' ? 'rtl' : 'ltr'}">
        <select id="servers" v-model="this.current_server_header" @change="changeServer">
            <option v-for="(server, key) in this.servers" :value="key" :key="key">{{ this.texts[server.name] + " " + server.id }}</option>
        </select>
        <div id="alliance_toggle">
            <button @click="this.toggleAllianceRanking" :class="[this.alliance_ranking ? '' : 'active']">{{ this.texts.player }}</button>
            <button @click="this.toggleAllianceRanking" :class="[this.alliance_ranking ? 'active' : '']">{{ this.texts.dialog_alliance_name_default }}</button>
        </div>
        <select id="events" v-model="this.current_event_name" @change="changeEvent">
            <option v-for="(event, key) in this.eventsList" :value="key" :key="key">{{ this.texts[key] }}</option>
        </select>
        <div id="content">
            <div id="navigate_buttons">
                <button @click="this.firstPage"><img src="assets/double_arrow_up.svg" alt="first page"/></button>
                <button @click="this.previousPage"><img src="assets/arrow_up.svg" alt="previous page"/></button>
                <button @click="this.nextPage"><img src="assets/arrow_up.svg" alt="next page" style="transform:rotate(180deg);"/></button>
                <button @click="this.lastPage"><img src="assets/double_arrow_up.svg" alt="last page" style="transform:rotate(180deg);"/></button>
            </div>
            <table id="table">
                <colgroup>
                    <col class="small_column">
                    <col>
                    <col>
                    <col class="small_column" v-if="this.hasPoints">
                    <col class="small_column" v-if="this.hasMedals && !this.alliance_ranking">
                    <col v-if="this.hasMedals">
                </colgroup>
                <thead>
                    <tr v-if="this.nbCategories > 1">
                        <th id="category" colspan="10">
                            <div>
                                <button @click="this.previousCategory"><img src="assets/arrow_up.svg" alt="next category" :class="this.current_language == 'ar' ? 'rightArrow' : 'leftArrow'"/></button>
                                <p> {{ this.texts[this.currentCategory.name].replace(this.currentCategory.placeholder ?? '{0}', this.currentCategory.value).trim().replace(/ +/g, ' ') }}</p>
                                <button @click="this.nextCategory"><img src="assets/arrow_up.svg" alt="previous category" :class="this.current_language == 'ar' ? 'leftArrow' : 'rightArrow'"/></button>
                            </div>                   
                        </th>
                    </tr>
                    <tr>
                        <th class="small_column">{{ this.texts.rank }}</th>
                        <th>{{ this.texts.dialog_highscore_name }}</th>
                        <th>{{ this.alliance_ranking ? this.texts.dialog_alliance_member : this.texts.dialog_alliance_name_default }}</th>
                        <th class="small_column" v-if="this.hasPoints">{{ this.texts.points_noValue }}</th>
                        <th v-if="this.hasMedals && !this.alliance_ranking">{{ this.texts.dialog_fame_rankTitle }}</th>
                        <th v-if="this.hasMedals">{{ this.texts.dialog_seasonLeague_medalsOverviewDialog_header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, index) in this.players" :key="index">
                        <td>&lrm;{{ this.formatNumber(player[this.offset(0)]) }}</td>
                        <td>{{ player[this.offset(2)]?.[this.alliance_ranking ? 1 : 'N'] }}</td>
                        <td>{{ player[this.offset(2)]?.[this.alliance_ranking ? 2 : 'AN'] }}</td>
                        <td v-if="this.hasPoints">&lrm;{{ this.formatNumber(player[this.offset(1)]) }}</td>
                        <td v-if="this.hasMedals && !this.alliance_ranking" class="title" :title="this.texts['seasonLeague_rank_' + player[this.offset(2)]?.KLRID]">
                            <img :src="'assets/title_' + (player[this.offset(2)]?.KLRID - 1 >> 2) + '.png'" alt="title"/>
                            <img v-if="(player[this.offset(2)]?.KLRID ?? 1) % 4 != 1" :src="'assets/title_level_' + (player[this.offset(2)].KLRID - 1) % 4  + '.png'" alt="title level"/>
                        </td>
                        <td v-if="this.hasMedals" class="medal">
                            <div><p>{{ this.nbMedals(player, 1) }}</p><img src="assets/medal_gold.png" alt="gold medal"/></div>
                            <div v-if="this.nbMedals(player, 2) > 0"><p>{{ this.nbMedals(player, 2) }}</p><img src="assets/medal_silver.png" alt="silver medal"/></div>
                            <div v-if="this.nbMedals(player, 3) > 0"><p>{{ this.nbMedals(player, 3) }}</p><img src="assets/medal_bronze.png" alt="bronze medal"/></div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td id="search" colspan="10">
                            <div>
                                <input id="search_input" :placeholder="this.texts.dialog_highscore_search" @keydown.enter="this.search"/>
                                <button @click="this.search"><img src="assets/search.svg" alt="search"/></button>
                            </div>                   
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <select id="languages" v-model="this.current_language" @change="changeLanguage">
            <option v-for="language in languages" :value="language" :key="language">{{ this.texts["language_native_" + language.toLowerCase()] }}</option>
        </select>
    </section>
    `,

    methods: {
        async getLanguages() {
            let languages_file = await fetch (`${this.proxy}https://empire-html5.goodgamestudios.com/config/languages/version.json`)
            languages_file = await languages_file.json();
            for (let language in languages_file.languages) {
                if (language != "") {
                    fetch(`https://langserv.public.ggs-ep.com/em@${languages_file.languages[language]}/${language}/@metadata`).then(response => {
                        if (response.ok) {
                            this.languages.push(language);
                        }
                    });
                }
            }
        },

        async changeLanguage() {
            let texts_file = await fetch(`https://langserv.public.ggs-ep.com/em/${this.current_language}`);
            Object.assign(this.texts, await texts_file.json());    
        },

        async getRankingsByRank() {
            const response = await fetch(`https://empire-api.fly.dev/${this.current_server_header}/hgh/%22LT%22:${this.currentEventId},%22LID%22:${this.currentCategory.id},%22SV%22:%22${encodeURIComponent(this.current_search)}%22`);
            const jsonData = await response.json();
            if (jsonData.return_code == "0") {
                this.players = jsonData.content.L;
                this.last_rank = jsonData.content.LR;
            }
            else {
                this.players = [];
                this.last_rank = 1;
            }
        },

        async getRankingsByName() {
            const response = await fetch(`https://empire-api.fly.dev/${this.current_server_header}/hgh/%22LT%22:${this.currentEventId},%22SV%22:%22${encodeURIComponent(this.current_search)}%22`);
            const jsonData = await response.json();
            let players;
            if (jsonData.return_code == "0") {
                players = jsonData.content.L;
                this.last_rank = jsonData.content.LR;
            }
            else {
                players = [];
                this.last_rank = 1;
            }
            if (players.length != 0) {
                this.current_category_index = Math.max(0, this.currentEvent.categories.findIndex(category => category.eventid == this.currentCategory.eventid && category.id == jsonData.content.LID));
                this.players = players;
            }
            else {
                alert(this.alliance_ranking ? this.texts.alert_allianceName_notFound : this.texts.alert_playerName_notFound)
            }
        },

        async changeServer() {
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async toggleAllianceRanking() {
            this.alliance_ranking = !this.alliance_ranking;
            if (!(this.current_event_name in this.eventsList)) {
                this.current_event_name = Object.keys(this.eventsList)[0];
            }
            this.current_category_index = 0;
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async changeEvent() {
            this.current_category_index = 0;
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async previousCategory() {
            this.current_category_index = (this.current_category_index + this.nbCategories - 1) % this.nbCategories;
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async nextCategory() {
            this.current_category_index = (this.current_category_index + 1) % this.nbCategories;
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async firstPage() {
            this.current_search = 1;
            await this.getRankingsByRank();
        },

        async lastPage() {
            this.current_search = this.last_rank;
            await this.getRankingsByRank();
        },

        async previousPage() {
            this.current_search = Math.max(1, this.players[(this.players.length - 1) >> 1]?.[this.offset(0)] - this.players.length || 1);
            await this.getRankingsByRank();
        },

        async nextPage() {
            this.current_search = this.players[(this.players.length - 1) >> 1]?.[this.offset(0)] + this.players.length || 1;
            await this.getRankingsByRank();
        },

        async search() {
            if (document.getElementById('search_input').value != "") {
                this.current_search = document.getElementById('search_input').value;
                if (/^-?[0-9]+$/.test(this.current_search)) {
                    if (+this.current_search <= 0) {
                        this.current_search = 1;
                    }
                    await this.getRankingsByRank();
                }
                else {
                    await this.getRankingsByName();
                }
            }
        },

        formatNumber(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
        },

        offset(index) {
            return index + (this.currentEvent.offset ?? 0) - (index >= 2 ? this.currentEvent.nopoints ?? 0 : 0);
        },

        nbMedals(player, type) {
            return player[this.offset(2 + this.alliance_ranking)]?.KLMO?.find(medal => medal[0] == type)?.[1] ?? 0;
        }
    },

    computed: {
        eventsList() {
            return this.events[this.alliance_ranking ? "alliance" : "player"] ?? {};
        },

        currentEvent() {
            return this.eventsList[this.current_event_name] ?? {};
        },

        currentEventId() {
            return this.currentCategory.eventid ?? this.currentEvent.id; 
        },

        currentCategory() {
            return this.currentEvent.categories?.[this.current_category_index] ?? this.currentEvent.categories?.[0] ?? {};
        },

        nbCategories() {
            return this.currentEvent.categories?.length ?? 0;
        },

        hasPoints() {
            return !this.currentEvent.nopoints && !this.currentEvent.isLeague;
        },

        hasMedals() {
            return !!this.currentEvent.isLeague;
        }
    }
});