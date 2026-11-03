import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // ใช้ CSS พื้นฐานของ Vite ไปก่อน

const app = createApp(App)
app.use(router)
app.mount('#app')