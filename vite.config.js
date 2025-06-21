import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { loadEnv } from "vite";
import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig((mode) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        base: process.env.VITE_BASE_PATH,
        plugins: [
            vue(),
            vueDevTools(),
            eslint(),
            VitePWA({
                registerType: "autoUpdate",
                manifest: {
                    name: "GGE & E4K Rankings",
                    short_name: "GGE & E4K Rankings",
                    description: "Discover the latest rankings for Goodgame Empire and Empire Four Kingdoms. Stay updated with the top players and alliances in GGE and E4K.",
                    theme_color: "#000000",
                    background_color: "#000000",
                    icons: [
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-48x48.png`,
                            sizes: "48x48",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-57x57.png`,
                            sizes: "57x57",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-60x60.png`,
                            sizes: "60x60",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-64x64.png`,
                            sizes: "64x64",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-72x72.png`,
                            sizes: "72x72",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-76x76.png`,
                            sizes: "76x76",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-96x96.png`,
                            sizes: "96x96",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-114x114.png`,
                            sizes: "114x114",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-120x120.png`,
                            sizes: "120x120",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-144x144.png`,
                            sizes: "144x144",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-152x152.png`,
                            sizes: "152x152",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-180x180.png`,
                            sizes: "180x180",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-192x192.png`,
                            sizes: "192x192",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-256x256.png`,
                            sizes: "256x256",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-384x384.png`,
                            sizes: "384x384",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                        {
                            src: `${process.env.VITE_BASE_PATH}images/icons/icon-512x512.png`,
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable any",
                        },
                    ],
                },
                workbox: {
                    clientsClaim: true,
                    skipWaiting: true,
                },
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
    };
});
