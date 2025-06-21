<script>
    import SelectInput from "@/components/SelectInput.vue";
    import ToggleInput from "@/components/ToggleInput.vue";
    import LoaderSquare from "./components/LoaderSquare.vue";
    export default {
        data() {
            let game = window.localStorage.getItem("game") === "e4k" ? "e4k" : "gge";
            return {
                game: game,
                languages: [],
                servers: {},
                events: {},
                texts: {},
                players: [],
                current_language: window.localStorage.getItem("language") ?? "fr",
                current_server_header:
                    window.localStorage.getItem("server") ??
                    (game === "e4k" ? "EmpirefourkingdomsExGG_2" : "EmpireEx_3"),
                current_event_name: window.sessionStorage.getItem("event") ?? "",
                current_category_index: window.sessionStorage.getItem("category") ?? 0,
                current_search: window.sessionStorage.getItem("search") ?? 1,
                search_input: "",
                last_rank: 1,
                alliance_id: window.sessionStorage.getItem("alliance_id") ?? "",
                alliance_players: [],
                alliance_ranking: window.sessionStorage.getItem("alliance") === "true",
                dark_mode:
                    window.localStorage.getItem("dark_mode") === "true"
                        ? true
                        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
                show_settings: false,
                base_path: import.meta.env.VITE_BASE_PATH,
            };
        },

        components: {
            SelectInput,
            ToggleInput,
            LoaderSquare,
        },

        async mounted() {
            await this.getLanguages();
            await this.getServers();
            await this.getEvents();

            await this.getRankings();
        },

        methods: {
            toggleSettings() {
                this.show_settings = !this.show_settings;
            },

            async getLanguages() {
                let languages_file = await fetch(
                    `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/languages/version.json`,
                );
                languages_file = await languages_file.json();

                let languages_texts = await fetch(`https://translations-api-test.public.ggs-ep.com/12/en/language_native_*`);
                languages_texts = await languages_texts.json();

                this.languages = Object.keys(languages_file.languages).filter(
                    (language) => `language_native_${language.toLowerCase()}` in languages_texts,
                );

                if (!this.languages.includes(this.current_language)) {
                    this.current_language = "fr";
                }
                await this.getTexts();
            },

            async getTexts() {
                let texts_file = await fetch(`https://translations-api-test.public.ggs-ep.com/12/${this.current_language}`);
                this.texts = await texts_file.json();
            },

            async changeLanguage(event) {
                this.current_language = event.target.value;
                await this.getTexts();
            },

            toggleDarkMode() {
                this.dark_mode = !this.dark_mode;
            },

            async toggleGame() {
                this.game = this.game === "e4k" ? "gge" : "e4k";
                await this.getServers();
                await this.getEvents();
                if (this.current_category_index < 0) {
                    this.current_category_index = 0;
                }

                await this.getRankings();
            },

            async getServers() {
                let serversFilesUrls = this.game === "e4k"
                    ? [
                          `${import.meta.env.VITE_PROXY_URL}https://raw.githubusercontent.com/danadum/ggs-assets/main/e4k/network.xml`,
                      ]
                    : [
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/1.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/5.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/11.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/26.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/34.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/39.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/64.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/65.xml`,
                          `${import.meta.env.VITE_PROXY_URL}https://empire-html5.goodgamestudios.com/config/network/68.xml`,
                      ];
                let noNameCount = 0;
                for (let url of serversFilesUrls) {
                    let servers_file = await fetch(url);
                    servers_file = new DOMParser().parseFromString(await servers_file.text(), "text/xml");
                
                    if (!this.servers) {
                        this.servers = {};
                    }
                    for (let instance of servers_file.firstElementChild.firstElementChild.children) {
                        if (instance.children[2].textContent != "EmpireEx_23") {
                            this.servers[instance.children[2].textContent] = {
                                name: instance.children[6].textContent,
                                id: instance.children[6].textContent ? instance.children[4].textContent : ++noNameCount,
                            };
                        }
                    }
                }
                if (!(this.current_server_header in this.servers)) {
                    this.current_server_header = this.game === "e4k" ? "EmpirefourkingdomsExGG_2" : "EmpireEx_3";
                }
            },

            async changeServer(event) {
                this.current_server_header = event.target.value;
                this.current_search = 1;
                if (this.current_category_index < 0) {
                    this.current_category_index = 0;
                }
                await this.getRankings();
            },

            async getEvents() {
                const response = await fetch(
                    `https://raw.githubusercontent.com/danadum/ggs-assets/main/${this.game}/events.json`,
                );
                this.events = await response.json();
                if (!(this.current_event_name in this.eventsList)) {
                    this.current_event_name = Object.keys(this.eventsList)[0];
                    this.current_category_index = 0;
                    this.current_search = 1;
                } else if (this.current_category_index > this.nbCategories) {
                    this.current_category_index = 0;
                    this.current_search = 1;
                }
            },

            async changeEvent(event) {
                this.current_event_name = event.target.value;
                this.current_search = 1;
                if (this.current_category_index >= 0) {
                    this.current_category_index = 0;
                }
                this.alliance_players = [];
                await this.getRankings();
            },

            async toggleAllianceRanking() {
                this.alliance_ranking = !this.alliance_ranking;
                this.current_event_name =
                    this.events.player_to_alliance.find((e) => e[+!this.alliance_ranking] == this.current_event_name)?.[
                        +this.alliance_ranking
                    ] ?? Object.keys(this.eventsList)[0];
                this.current_category_index = 0;
                this.current_search = 1;
                await this.getRankings();
            },

            async changeCategory(category_index) {
                this.current_category_index = (category_index + this.nbCategories) % this.nbCategories;
                this.current_search = 1;
                await this.getRankings();
            },

            async previousCategory() {
                this.changeCategory(this.current_category_index - 1);
            },

            async nextCategory() {
                this.changeCategory(this.current_category_index + 1);
            },

            async firstPage() {
                this.current_search = 1;
                await this.getRankings();
            },

            async lastPage() {
                this.current_search = this.last_rank;
                await this.getRankings();
            },

            async previousPage() {
                this.current_search = Math.max(
                    1,
                    this.players[this.currentEvent.global ? 0 : (this.players.length - 1) >> 1]?.[this.currentEvent.global ? "R" : this.offset(0)] - this.players.length || 1,
                );
                await this.getRankings();
            },

            async nextPage() {
                this.current_search =
                    this.players[this.currentEvent.global ? 0 : (this.players.length - 1) >> 1]?.[this.currentEvent.global ? "R" : this.offset(0)] + this.players.length || 1;
                await this.getRankings();
            },

            async toPage(page) {
                this.current_search = this.players.length * (page - 1) + ( this.currentEvent.global ? 1 : (this.players.length - 1) >> 1);
                await this.getRankings();
            },

            async toggleAlliancePlayersRanking(alliance) {
                this.players = [];
                this.alliance_players = [];
                this.alliance_ranking = !this.alliance_ranking;
                this.current_event_name =
                    this.events.player_to_alliance.find((e) => e[+!this.alliance_ranking] == this.current_event_name)?.[
                        +this.alliance_ranking
                    ] ?? Object.keys(this.eventsList)[0];
                this.current_category_index = -1;
                this.current_search = 1;
                this.alliance_id = alliance[0];
                await this.getRankings();
            },

            async search() {
                if (this.search_input != "") {
                    this.current_search = this.search_input;
                    await this.getRankings();
                }
            },

            async getRankings() {
                if (/^-?[0-9]+$/.test(this.current_search)) {
                    if (+this.current_search <= 0) {
                        this.current_search = 1;
                    }
                    if (this.current_category_index >= 0) {
                        if (this.currentEvent.global) {
                            await this.getGlobalRankingsByRank();
                        } else {
                            await this.getRankingsBySearch();
                        }
                    } else {
                        await this.getRankingsByAlliance(this.alliance_id);
                    }
                } else {
                    if (this.current_category_index >= 0) {
                        if (this.currentEvent.global) {
                            await this.getGlobalRankingsByName();
                        } else {
                            await this.getRankingsByName();
                        }
                    } else {
                        await this.getRankingsByNameInAlliance();
                    }
                }
            },

            async getRankingsBySearch(ignoreCategory = false) {
                const response = await fetch(
                    `${this.apiURL}/${this.current_server_header}/hgh/%22LT%22:${this.currentEventId}${!ignoreCategory && this.currentCategory.id ? ',%22LID%22:' + this.currentCategory.id : ''},%22SV%22:%22${encodeURIComponent(this.current_search)}%22`,
                );
                const jsonData = await response.json();
                if (jsonData.return_code == "0") {
                    if (jsonData.content.L.length) {
                        this.players = jsonData.content.L;
                        this.last_rank = jsonData.content.LR;
                        this.current_category_index = Math.max(
                            0,
                            this.currentEvent.categories.findIndex(
                                (category) =>
                                    category.eventid == this.currentCategory.eventid &&
                                    category.id == (jsonData.content.LID ?? null),
                            ),
                        );
                    } else {
                        this.players = null;
                        this.last_rank = 1;
                    }
                } else if (jsonData.error) {
                    this.players = null;
                    this.last_rank = 1;
                } else {
                    this.players = [];
                    this.last_rank = 1;
                }
            },

            async getRankingsByName() {
                let players = this.players;
                let last_rank = this.last_rank;
                await this.getRankingsBySearch(true);
                if (this.players == null || this.players.length == 0) {
                    this.players = players;
                    this.last_rank = last_rank;
                    alert(
                        this.alliance_ranking
                            ? this.texts.alert_allianceName_notFound
                            : this.texts.alert_playerName_notFound,
                    );
                }
            },

            async getGlobalRankingsByRank() {
                const response = await fetch(
                    `${this.apiURL}/${this.current_server_header}/llsp/%22LT%22:${this.currentEventId}${this.currentCategory.id ? ',%22LID%22:' + this.currentCategory.id : ''},%22R%22:${encodeURIComponent(this.current_search)}`,
                );
                const jsonData = await response.json();
                if (jsonData.return_code == "0") {
                    if (jsonData.content.L.length) {
                        this.players = jsonData.content.L;
                        this.last_rank = jsonData.content.T;
                        this.current_category_index = Math.max(
                            0,
                            this.currentEvent.categories.findIndex(
                                (category) =>
                                    category.eventid == this.currentCategory.eventid &&
                                    category.id == (jsonData.content.LID ?? null),
                            ),
                        );
                    } else {
                        this.players = null;
                        this.last_rank = 1;
                    }
                } else if (jsonData.error) {
                    this.players = null;
                    this.last_rank = 1;
                } else {
                    this.players = [];
                    this.last_rank = 1;
                }
            },

            async getGlobalRankingsByName() {
                const response = await fetch(
                    `${this.apiURL}/${this.current_server_header}/slse/%22LT%22:${this.currentEventId},%22SV%22:%22${encodeURIComponent(this.current_search)}%22`,
                );
                const jsonData1 = await response.json();
                if (jsonData1.return_code == "0" && jsonData1.content.L.length && jsonData1.content.L[0].L.length) {
                    const searchCategory = jsonData1.content.L[0].LID;
                    const searchId = jsonData1.content.L[0].L[0];
                    const response = await fetch(
                        `${this.apiURL}/${this.current_server_header}/llsw/%22LT%22:${this.currentEventId}${searchCategory && searchCategory !== -1 ? ',%22LID%22:' + searchCategory : ''},%22SI%22:%22${encodeURIComponent(searchId)}%22`,
                    );
                    const jsonData = await response.json();
                    if (jsonData.return_code == "0") {
                        if (jsonData.content.L.length) {
                            this.players = jsonData.content.L;
                            this.last_rank = jsonData.content.T;
                            this.current_category_index = Math.max(
                                0,
                                this.currentEvent.categories.findIndex(
                                    (category) =>
                                        category.eventid == this.currentCategory.eventid &&
                                        category.id == (jsonData.content.LID ?? null),
                                ),
                            );
                        } else {
                            alert(
                                this.alliance_ranking
                                    ? this.texts.alert_allianceName_notFound
                                    : this.texts.alert_playerName_notFound,
                            );
                        }
                    } else {
                        alert(
                        this.alliance_ranking
                            ? this.texts.alert_allianceName_notFound
                            : this.texts.alert_playerName_notFound,
                        );
                    }
                } else {
                    alert(
                        this.alliance_ranking
                            ? this.texts.alert_allianceName_notFound
                            : this.texts.alert_playerName_notFound,
                    );
                }
            },

            async getRankingsByAlliance() {
                if (this.alliance_id != this.alliance_players[0]?.[this.offset(2)]?.AID) {
                    let alliance = await fetch(
                        `${this.apiURL}/${this.current_server_header}/ain/%22AID%22:${this.alliance_id}`,
                    );
                    alliance = await alliance.json();
                    if (alliance.return_code == "0") {
                        let members = alliance.content.A.M;

                        let requests = await Promise.all(
                            members.map(async (member) => {
                                let response = await fetch(
                                    `${this.apiURL}/${this.current_server_header}/hgh/%22LT%22:${this.currentEventId},%22SV%22:%22${encodeURIComponent(member.N)}%22`,
                                );
                                return [member, await response.json()];
                            }),
                        );

                        let ranks = requests.map(([member, response]) => {
                            if (response.return_code == "0") {
                                for (let rank of response.content.L) {
                                    if (rank[2].OID == member.OID) {
                                        return rank;
                                    }
                                }
                            }
                            return [-1, 0, member];
                        });
                        ranks.sort((a, b) => b[1] - a[1]);
                        ranks.forEach((rank, i) => (rank[0] = i + 1));
                        this.alliance_players = ranks;
                    }
                }
                this.last_rank = this.alliance_players.length;
                let start = Math.max(Math.min(+this.current_search - 5, this.alliance_players.length - 10), 0);
                let end = Math.min(Math.max(+this.current_search + 5, 10), this.alliance_players.length);
                this.players = this.alliance_players.slice(start, end);
            },

            async getRankingsByNameInAlliance() {
                this.current_search = this.alliance_players.findIndex(
                    (player) => player[this.offset(2)].N.toLowerCase() == this.current_search.toLowerCase(),
                );

                if (this.current_search == -1) {
                    this.current_search = 1;
                    alert(this.texts.alert_playerName_notFound);
                }
                this.getRankingsByAlliance(this.alliance_id);
            },

            downloadCsv() {
                let csvData = [
                    [
                        this.texts.rank,
                        this.texts.points_noValue,
                        this.texts.generic_username,
                        this.texts.dialog_alliance_name,
                    ].join(";"),
                ];
                csvData.push(
                    ...this.players.map((player) =>
                        [
                            player[this.offset(0)],
                            player[this.offset(1)],
                            player[this.offset(2)].N,
                            player[this.offset(2)].AN,
                        ].join(";"),
                    ),
                );
                let a = document.createElement("a");
                a.href = window.URL.createObjectURL(new Blob([csvData.join("\n")], { type: "text/csv" }));
                a.download = "ranking.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
            },

            formatNumber(number) {
                return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
            },

            offset(index) {
                return index + (this.currentEvent.offset ?? 0) - (index >= 2 ? (this.currentEvent.nopoints ?? 0) : 0);
            },

            nbMedals(player, type) {
                return (
                    player[this.offset(2 + this.alliance_ranking)]?.KLMO?.find((medal) => medal[0] == type)?.[1] ?? 0
                );
            },

            getPlayerServerName(player) {
                const serverId = player.SI?.split("-")?.[2];
                const baseServerKey = this.game === "e4k" ? "EmpirefourkingdomsExGG" : "EmpireEx";
                const serverKey = serverId === "1" ? baseServerKey : baseServerKey + "_" + serverId;
                const server = this.servers[serverKey];
                return server ? (server.name ? this.texts[server.name] + " " + server.id : this.texts.alienInvasion_world_178.replace("1", server.id)) : "";
            },
        },

        computed: {
            apiURL() {
                return this.game === "e4k" ? import.meta.env.VITE_E4K_API_URL : import.meta.env.VITE_GGE_API_URL;
            },

            eventsList() {
                return this.events[this.alliance_ranking ? "alliance" : "player"] ?? {};
            },

            currentEvent() {
                return this.eventsList[this.current_event_name] ?? {};
            },

            currentEventId() {
                return this.currentCategory.eventid ?? this.currentEvent.id;
            },

            nbCategories() {
                return this.currentEvent.categories?.length ?? 0;
            },

            currentCategory() {
                return (
                    this.currentEvent.categories?.[this.current_category_index] ??
                    this.currentEvent.categories?.[0] ??
                    {}
                );
            },

            currentPageNumber() {
                return this.players?.length > 0
                    ? ~~((this.players.at(-1)[this.currentEvent.global ? "R" : this.offset(0)] - 1) / this.players.length) + 1
                    : 1;
            },

            lastPageNumber() {
                return this.players?.length > 0 ? ~~((this.last_rank - 1) / this.players.length) + 1 : 1;
            },

            hasPoints() {
                return !this.currentEvent.nopoints && !this.currentEvent.isLeague;
            },

            hasMedals() {
                return !!this.currentEvent.isLeague;
            },
        },

        watch: {
            current_language(newValue, _oldValue) {
                window.localStorage.setItem("language", newValue);
                document.documentElement.lang = this.current_language;
            },

            dark_mode(newValue, _oldValue) {
                window.localStorage.setItem("dark_mode", newValue);
            },

            game(newValue, _oldValue) {
                window.localStorage.setItem("game", newValue);
            },

            current_server_header(newValue, _oldValue) {
                window.localStorage.setItem("server", newValue);
            },

            current_event_name(newValue, _oldValue) {
                window.sessionStorage.setItem("event", newValue);
            },

            current_category_index(newValue, _oldValue) {
                window.sessionStorage.setItem("category", newValue);
            },

            current_search(newValue, _oldValue) {
                window.sessionStorage.setItem("search", newValue);
            },

            alliance_ranking(newValue, _oldValue) {
                window.sessionStorage.setItem("alliance", newValue);
            },

            alliance_id(newValue, _oldValue) {
                window.sessionStorage.setItem("alliance_id", newValue);
            },
        },
    };
</script>

<template>
    <section
        :dir="this.current_language == 'ar' ? 'rtl' : 'ltr'"
        :class="{ dark: this.dark_mode, 'overflow-hidden': this.show_settings }"
        class="overflow-y-auto flex flex-col pt-1 h-dvh bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-300">
        <LoaderSquare
            v-if="
                !Object.keys(this.texts).length || !Object.keys(this.servers).length || !Object.keys(this.events).length
            "
            class="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-48"></LoaderSquare>
        <div
            v-if="Object.keys(this.texts).length && Object.keys(this.servers).length && Object.keys(this.events).length"
            class="grow flex flex-col">
            <div v-if="!this.show_settings">
                <button
                    @click="this.toggleSettings"
                    type="button"
                    class="p-2.5 min-w-[40px] absolute top-2.5 start-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    aria-label="Settings">
                    <div
                        :style="`mask-image:url(${this.base_path}icons/settings.svg)`"
                        class="bg-current">
                        <img
                            :src="`${this.base_path}icons/settings.svg`"
                            alt="Settings"
                            class="h-6 opacity-0" />
                    </div>
                </button>
            </div>
            <div v-if="this.show_settings" class="z-50 absolute top-0 start-0 h-dvh w-dvw"></div>
            <div
                v-if="this.show_settings"
                id="drawer-navigation"
                class="flex flex-col fixed top-0 start-0 z-50 w-64 h-dvh p-4 overflow-y-auto transition-transform bg-neutral-50 dark:bg-neutral-800"
                tabindex="-1"
                aria-labelledby="drawer-navigation-label">
                <h5
                    id="drawer-navigation-label"
                    class="text-base font-semibold uppercase text-neutral-400 dark:text-neutral-500">
                    {{ this.texts.settings }}
                </h5>
                <button
                    @click="this.toggleSettings"
                    type="button"
                    class="p-2.5 min-w-[40px] absolute top-2.5 end-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    aria-label="Close">
                    <div
                        :style="`mask-image:url(${this.base_path}icons/close.svg)`"
                        class="bg-current">
                        <img :src="`${this.base_path}icons/close.svg`" alt="Close" class="h-4 opacity-0" />
                    </div>
                </button>
                <div class="flex flex-col grow py-4 overflow-y-auto">
                    <ul class="flex flex-col grow space-y-2 font-medium">
                        <li>
                            <SelectInput
                                :title="this.texts.dialog_language_name"
                                :options="
                                    languages.map((language) => ({
                                        key: language,
                                        value: language,
                                        text:
                                            this.texts['language_native_' + language.toLowerCase()] ??
                                            this.texts['generic_language_' + language.toLowerCase()],
                                    }))
                                "
                                :value="this.current_language"
                                :change="changeLanguage" />
                        </li>
                        <li>
                            <ToggleInput
                                name="dark_mode"
                                :value="this.dark_mode"
                                :change="toggleDarkMode"
                                :choices="[
                                    { text: '', icon: `${this.base_path}icons/sun.svg` },
                                    { text: '', icon: `${this.base_path}icons/moon.svg` },
                                ]" />
                        </li>
                        <li>
                            <ToggleInput
                                name="game"
                                :value="this.game === 'e4k'"
                                :change="toggleGame"
                                :choices="[
                                    { text: 'GGE', icon: `${this.base_path}icons/laptop.svg` },
                                    { text: 'E4K', icon: `${this.base_path}icons/mobile.svg` },
                                ]" />
                        </li>
                        <li class="!mt-auto">
                            <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                                <span class="text-sm text-neutral-400 dark:text-neutral-500 sm:text-center">
                                    Made by
                                    <a href="https://github.com/danadum" class="hover:underline">Danadum</a>.
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <img
                :src="`${this.base_path}images/logo-${this.game}.png`"
                alt="Game logo"
                class="w-1/4 min-w-36 max-w-80 mx-auto mb-2" />
            <div class="flex flex-wrap mx-1.5 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                <SelectInput
                    class="grow-[10]"
                    :title="this.texts.generic_server?.replace(/ ?: ?/g, '')"
                    :options="
                        Object.entries(this.servers).map(([key, value]) => ({
                            key: key,
                            value: key,
                            text: value.name ? this.texts[value.name] + ' ' + value.id : this.texts.alienInvasion_world_178.replace('1', value.id),
                        }))
                    "
                    :value="this.current_server_header"
                    :change="changeServer" />
                <SelectInput
                    class="grow-[10]"
                    :title="this.texts.dialog_tempServer_Ranking_title"
                    :options="
                        Object.entries(this.eventsList).map(([key, value]) => ({
                            key: key,
                            value: key,
                            text: this.texts[key],
                        }))
                    "
                    :value="this.current_event_name"
                    :change="changeEvent" />
                <ToggleInput
                    class="grow"
                    name="alliance_ranking"
                    :value="this.alliance_ranking"
                    :change="toggleAllianceRanking"
                    :choices="[
                        { text: this.texts.player, image: `${this.base_path}images/player.png` },
                        {
                            text: this.texts.dialog_alliance_name_default,
                            image: `${this.base_path}images/alliance.png`,
                        },
                    ]" />
            </div>
            <div class="grow flex flex-col">
                <div class="grow flex flex-col overflow-x-auto">
                    <div class="grow flex flex-col p-1.5 min-w-full align-middle">
                        <div
                            class="grow flex flex-col border rounded-lg overflow-hidden shadow divide-y divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700 dark:shadow-gray-900">
                            <div v-if="this.nbCategories > 1 || this.current_category_index < 0" class="py-1 px-4">
                                <nav class="flex items-center justify-center space-x-1" aria-label="Category">
                                    <button
                                        @click="this.previousCategory"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Previous">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/arrow_up.svg)`"
                                            class="bg-current -rotate-90 rtl:rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/arrow_up.svg`"
                                                alt="Previous Category"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                    <p
                                        class="min-w-[150px] flex justify-center items-center py-2.5 text-sm rounded-full">
                                        {{
                                            this.current_category_index < 0
                                                ? this.players[0]?.[this.offset(2)]?.AN
                                                : this.texts[this.currentCategory.name]
                                                      .replace(
                                                          this.currentCategory.placeholder ?? "{0}",
                                                          this.currentCategory.value,
                                                      )
                                                      .trim()
                                                      .replace(/ +/g, " ")
                                        }}
                                    </p>
                                    <button
                                        @click="this.nextCategory"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Next">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/arrow_up.svg)`"
                                            class="bg-current rotate-90 rtl:-rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/arrow_up.svg`"
                                                alt="Next Category"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                    <button
                                        v-if="this.current_category_index < 0"
                                        @click="this.downloadCsv"
                                        type="button"
                                        class="absolute end-2 p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Download">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/download.svg)`"
                                            class="bg-current">
                                            <img
                                                :src="`${this.base_path}icons/download.svg`"
                                                alt="Download"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                </nav>
                            </div>
                            <div class="grow flex flex-col overflox-x-auto overflow-y-hidden">
                                <table class="grow divide-y divide-gray-200 dark:divide-neutral-700">
                                    <thead class="bg-neutral-100 dark:bg-neutral-700">
                                        <tr>
                                            <th
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.rank }}
                                            </th>
                                            <th
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.dialog_highscore_name }}
                                            </th>
                                            <th
                                                v-if="!this.currentCategory.isCurrentOuter"
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{
                                                    this.alliance_ranking
                                                        ? this.texts.dialog_alliance_member
                                                        : this.texts.dialog_alliance_name_default
                                                }}
                                            </th>
                                            <th
                                                v-if="this.currentEvent.global"
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.generic_server?.replace(/ ?: ?/g, '') }}
                                            </th>
                                            <th
                                                v-if="this.hasPoints"
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.points_noValue }}
                                            </th>
                                            <th
                                                v-if="this.hasMedals && !this.alliance_ranking"
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.dialog_fame_rankTitle }}
                                            </th>
                                            <th
                                                v-if="this.hasMedals"
                                                scope="col"
                                                class="px-1 py-3 text-center text-xs font-medium text-neutral-400 uppercase dark:text-neutral-500">
                                                {{ this.texts.dialog_seasonLeague_medalsOverviewDialog_header }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="relative" v-if="!this.players?.length">
                                        <LoaderSquare
                                            v-if="this.players !== null"
                                            class="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-24"></LoaderSquare>
                                        <div
                                            v-if="this.players === null"
                                            class="text-center absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div
                                            :style="`mask-image:url(${this.base_path}icons/error.svg)`"
                                            class="bg-current w-fit m-auto">
                                                <img
                                                    :src="`${this.base_path}icons/error.svg`"
                                                    alt="Error"
                                                    class="h-20 opacity-0" />
                                            </div>
                                            <span>
                                                {{ this.texts.eventNotRunning }}
                                            </span>
                                        </div>
                                    </tbody>
                                    <tbody
                                        v-if="this.players?.length"
                                        class="divide-y divide-gray-200 dark:divide-neutral-700">
                                        <tr
                                            :class="{
                                                'bg-yellow-300':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 1,
                                                'hover:bg-yellow-400':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 1,
                                                'dark:bg-yellow-600':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 1,
                                                'dark:hover:bg-yellow-500':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 1,
                                                'bg-gray-300':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 2,
                                                'hover:bg-gray-400':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 2,
                                                'dark:bg-gray-600':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 2,
                                                'dark:hover:bg-gray-500':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 2,
                                                'bg-yellow-700':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 3,
                                                'hover:bg-yellow-800':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 3,
                                                'dark:bg-yellow-900':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 3,
                                                'dark:hover:bg-yellow-800':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) === 3,
                                                'hover:bg-neutral-100':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) > 3,
                                                'dark:hover:bg-neutral-700':
                                                    (this.currentEvent.global
                                                        ? player.R
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : player[this.offset(0)]) > 3,
                                            }"
                                            v-for="(player, index) in this.players"
                                            :key="index">
                                            <td class="px-1 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                {{
                                                    this.currentEvent.global
                                                        ? this.formatNumber(player.R)
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(4)]
                                                            : this.formatNumber(player[this.offset(0)])
                                                }}
                                            </td>
                                            <td class="px-1 py-2 whitespace-nowrap text-center text-sm">
                                                {{
                                                    this.currentEvent.global
                                                        ? player.P
                                                        : this.currentCategory.isCurrentOuter
                                                            ? player[this.offset(3)]
                                                            : player[this.offset(2)]?.[this.alliance_ranking ? 1 : "N"]
                                                }}
                                            </td>
                                            <td
                                                v-if="!this.currentCategory.isCurrentOuter && this.alliance_ranking"
                                                class="px-1 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    @click="this.toggleAlliancePlayersRanking(player[this.offset(2)])"
                                                    type="button"
                                                    class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:hover:text-blue-400 dark:focus:text-blue-400">
                                                    {{ player[this.offset(2)]?.[2] }}
                                                    <div
                                                        v-if="player[this.offset(2)]?.[2]"
                                                        :style="`mask-image:url(${this.base_path}icons/view.svg)`"
                                                        class="bg-current">
                                                        <img
                                                            :src="`${this.base_path}icons/view.svg`"
                                                            alt="View"
                                                            class="h-4 opacity-0" />
                                                    </div>
                                                </button>
                                            </td>
                                            <td
                                                v-if="!this.currentCategory.isCurrentOuter && !this.alliance_ranking"
                                                class="px-1 py-2 whitespace-nowrap text-center text-sm">
                                                {{
                                                    this.currentEvent.global
                                                        ? player.A
                                                        : player[this.offset(2)]?.AN
                                                }}
                                            </td>
                                            <td
                                                v-if="this.currentEvent.global"
                                                class="px-1 py-2 whitespace-nowrap text-center text-sm">
                                                {{             
                                                    this.getPlayerServerName(player)
                                                }}
                                            </td>
                                            <td
                                                v-if="this.hasPoints"
                                                class="px-1 py-2 whitespace-nowrap text-center text-sm">
                                                {{
                                                    this.currentEvent.global
                                                        ? this.formatNumber(player.S)
                                                        : this.formatNumber(player[this.offset(1)])
                                                }}
                                            </td>
                                            <td
                                                v-if="this.hasMedals && !this.alliance_ranking"
                                                :title="
                                                    this.texts['seasonLeague_rank_' + player[this.offset(2)]?.KLRID]
                                                "
                                                class="px-1 py-2 min-w-20 whitespace-nowrap text-center text-sm">
                                                <img
                                                    v-if="player[this.offset(2)]?.KLRID !== undefined"
                                                    class="h-8 inline-block"
                                                    :src="
                                                        `${this.base_path}images/title_` +
                                                        ((player[this.offset(2)]?.KLRID - 1) >> 2) +
                                                        '.png'
                                                    "
                                                    alt="title" />
                                                <img
                                                    class="h-8 inline-block"
                                                    v-if="(player[this.offset(2)]?.KLRID ?? 1) % 4 != 1"
                                                    :src="
                                                        `${this.base_path}images/title_level_` +
                                                        ((player[this.offset(2)].KLRID - 1) % 4) +
                                                        '.png'
                                                    "
                                                    alt="title level" />
                                            </td>
                                            <td
                                                v-if="this.hasMedals"
                                                :class="`min-w-${12 * ((this.nbMedals(player, 1) > 0) + (this.nbMedals(player, 2) > 0) + (this.nbMedals(player, 3) > 0))}`"
                                                class="px-1 py-2 whitespace-nowrap text-center text-sm">
                                                <div class="space-x-2">
                                                    <div
                                                        v-if="this.nbMedals(player, 1) > 0"
                                                        class="space-x-1 inline-block">
                                                        <span>{{ this.nbMedals(player, 1) }}</span>
                                                        <img
                                                            :src="`${this.base_path}images/medal_gold.png`"
                                                            alt="Gold medal"
                                                            class="h-4 inline-block" />
                                                    </div>
                                                    <div
                                                        v-if="this.nbMedals(player, 2) > 0"
                                                        class="space-x-1 inline-block">
                                                        <span>{{ this.nbMedals(player, 2) }}</span>
                                                        <img
                                                            :src="`${this.base_path}images/medal_silver.png`"
                                                            alt="Silver medal"
                                                            class="h-4 inline-block" />
                                                    </div>
                                                    <div
                                                        v-if="this.nbMedals(player, 3) > 0"
                                                        class="space-x-1 inline-block">
                                                        <span>{{ this.nbMedals(player, 3) }}</span>
                                                        <img
                                                            :src="`${this.base_path}images/medal_bronze.png`"
                                                            alt="Bronze medal"
                                                            class="h-4 inline-block" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr
                                            class="invisible border-none"
                                            v-for="index in this.players.length > 0 && this.players.length < 6
                                                ? 6 - this.players.length
                                                : 0"
                                            :key="index">
                                            <td class="px-1 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                .
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="py-3 px-4 flex flex-wrap justify-center gap-y-1">
                                <div class="relative max-w-xs mx-auto">
                                    <label class="sr-only">Search</label>
                                    <input
                                        @keydown.enter="this.search"
                                        v-model="search_input"
                                        type="text"
                                        class="min-w-[200px] py-2 px-3 ps-9 block w-full bg-transparent border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                        :placeholder="this.texts.dialog_highscore_search" />
                                    <div
                                        class="absolute inset-y-0 start-0 flex items-center ps-3 cursor-pointer"
                                        @click="this.search">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/search.svg)`"
                                            class="bg-current">
                                            <img
                                                :src="`${this.base_path}icons/search.svg`"
                                                alt="Search"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </div>
                                </div>
                                <nav class="flex items-center space-x-1" aria-label="Pagination">
                                    <button
                                        :class="{
                                            invisible:
                                                this.currentPageNumber === 1 &&
                                                (this.players?.[0]?.[this.currentEvent.global ? 'R' : this.offset(0)] ?? 1) === 1,
                                        }"
                                        @click="this.firstPage"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="First">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/double_arrow_up.svg)`"
                                            class="bg-current -rotate-90 rtl:rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/double_arrow_up.svg`"
                                                alt="First page"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                    <button
                                        :class="{
                                            invisible:
                                                this.currentPageNumber === 1 &&
                                                (this.players?.[0]?.[this.currentEvent.global ? 'R' : this.offset(0)] ?? 1) === 1,
                                        }"
                                        @click="this.previousPage"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Previous">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/arrow_up.svg)`"
                                            class="bg-current -rotate-90 rtl:rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/arrow_up.svg`"
                                                alt="Previous page"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                    <button
                                        v-if="
                                            this.currentPageNumber === this.lastPageNumber && this.currentPageNumber > 2
                                        "
                                        @click="toPage(this.currentPageNumber - 2)"
                                        type="button"
                                        class="min-w-[40px] flex justify-center items-center hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                                        {{ this.currentPageNumber - 2 }}
                                    </button>
                                    <button
                                        v-if="this.currentPageNumber > 1"
                                        @click="toPage(this.currentPageNumber - 1)"
                                        type="button"
                                        class="min-w-[40px] flex justify-center items-center hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                                        {{ this.currentPageNumber - 1 }}
                                    </button>
                                    <button
                                        type="button"
                                        class="underline underline-offset-4 min-w-[40px] flex justify-center items-center hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-current="page">
                                        {{ this.currentPageNumber }}
                                    </button>
                                    <button
                                        v-if="this.currentPageNumber < this.lastPageNumber"
                                        @click="toPage(this.currentPageNumber + 1)"
                                        type="button"
                                        class="min-w-[40px] flex justify-center items-center hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                                        {{ this.currentPageNumber + 1 }}
                                    </button>
                                    <button
                                        v-if="
                                            this.currentPageNumber === 1 &&
                                            this.currentPageNumber < this.lastPageNumber - 1
                                        "
                                        @click="toPage(this.currentPageNumber + 2)"
                                        type="button"
                                        class="min-w-[40px] flex justify-center items-center hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                                        {{ this.currentPageNumber + 2 }}
                                    </button>
                                    <button
                                        :class="{
                                            invisible:
                                                this.currentPageNumber === this.lastPageNumber &&
                                                (this.players?.at(-1)?.[this.currentEvent.global ? 'R' : this.offset(0)] ?? 1) === this.last_rank,
                                        }"
                                        @click="this.nextPage"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Next">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/arrow_up.svg)`"
                                            class="bg-current rotate-90 rtl:-rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/arrow_up.svg`"
                                                alt="Next page"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                    <button
                                        :class="{
                                            invisible:
                                                this.currentPageNumber === this.lastPageNumber &&
                                                (this.players?.at(-1)?.[this.currentEvent.global ? 'R' : this.offset(0)] ?? 1) === this.last_rank,
                                        }"
                                        @click="this.lastPage"
                                        type="button"
                                        class="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                                        aria-label="Last">
                                        <div
                                            :style="`mask-image:url(${this.base_path}icons/double_arrow_up.svg)`"
                                            class="bg-current rotate-90 rtl:-rotate-90">
                                            <img
                                                :src="`${this.base_path}icons/double_arrow_up.svg`"
                                                alt="Last page"
                                                class="h-4 opacity-0" />
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
