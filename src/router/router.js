import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)


const routes = [{
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]


const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 表示将要访问的路径
  // from 代表从哪个路径跳转而来
  // next是一个函数，表示放行
  // next() 直接放行   next('/login')强制跳转到某页面
  if (to.path === '/login') return next()
  if (!window.sessionStorage.getItem('token')) return next('/login')
  next()
})

export default router