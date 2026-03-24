import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VuePages from "vite-plugin-pages";
import VueLayouts from "vite-plugin-vue-meta-layouts";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import UnoCSS from "unocss/vite";
import { fileURLToPath, URL } from "node:url";

const backendSrc = fileURLToPath(new URL("../backend/src", import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    VuePages(),
    VueLayouts(),
    UnoCSS(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia", "@vueuse/core"],
      dts: "src/auto-imports.d.ts",
      resolvers: [NaiveUiResolver()],
    }),
    Components({
      dts: "src/components.d.ts",
      resolvers: [NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@ruoyi/backend": backendSrc,
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
