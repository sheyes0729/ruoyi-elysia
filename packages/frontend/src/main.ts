import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./style.css";
import { vPermission } from "@/directives";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.directive("permission", vPermission);

app.mount("#app");
