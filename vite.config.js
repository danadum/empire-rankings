import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { loadEnv } from "vite";
import eslint from 'vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig((mode) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        base: process.env.VITE_BASE_PATH,
        plugins: [
          vue(),
          vueDevTools(),
          eslint(),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
    };
});
