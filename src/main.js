import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as bootstrap from 'bootstrap'

const app = createApp(App)

app.use(router)

app.config.globalProperties.$bootstrap = bootstrap

app.mount('#app')