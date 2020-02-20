import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './plugins/element.js'
//图标字体
import './assets/fonts/iconfont.css'
//全局样式
import './assets/css/global.css'

import axios from 'axios'
Vue.prototype.$http = axios;
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')