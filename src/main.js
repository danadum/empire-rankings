import "./assets/styles/main.css";

import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

document.title = import.meta.env.VITE_GAME === "e4k" ? "E4K rankings" : "GGE rankings";
app.mount("#app");
