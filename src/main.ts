import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import router from './router'
// 引入ant-design-vue的图标组件
import * as Icons from '@ant-design/icons-vue'

const app = createApp(App)
app.use(Antd)
app.use(router)

// 注册所有图标组件
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})

app.mount('#app')
