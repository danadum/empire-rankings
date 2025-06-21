import "./assets/styles/main.css";

import { registerSW } from 'virtual:pwa-register';
import { createApp } from "vue";
import App from "./App.vue";

const updateSW = registerSW({
    onNeedRefresh() {
        updateSW(true);
    },
    onOfflineReady() {
        console.log("App is ready to work offline.");
    },
});

const app = createApp(App);
app.mount("#app");
