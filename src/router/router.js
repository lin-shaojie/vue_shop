import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/params.vue'
import GoodsList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Orders from '../components/order/Orders.vue'
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
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Orders
      }
    ]
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