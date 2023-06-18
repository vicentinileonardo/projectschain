import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Toast, { POSITION } from "vue-toastification";
import type { PluginOptions } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 2000,
};

app.use(Toast, options);
app.mount('#app')
