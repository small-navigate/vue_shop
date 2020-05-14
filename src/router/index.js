import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login.vue'
// import Home from '../components/home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
// import Rigths from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const Users = () => import(/* webpackChunkName: "Users_Rigths_Roles" */ '../components/user/Users.vue')
const Rigths = () => import(/* webpackChunkName: "Users_Rigths_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rigths_Roles" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import Add from '../components/goods/Add.vue'
// import Report from '../components/report/Report.vue'
const Add = () => import(/* webpackChunkName: "Add_Report" */ '../components/goods/Add.vue')
const Report = () => import(/* webpackChunkName: "Add_Report" */ '../components/report/Report.vue')

// import GoodsList from '../components/goods/Goods_list.vue'
// import Order from '../components/order/Order.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_Order" */ '../components/goods/Goods_list.vue')
const Order = () => import(/* webpackChunkName: "GoodsList_Order" */ '../components/order/Order.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rigths },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数 表示放行
  // next()  放行 next('/login')  强制跳转
  // eslint-disable-next-line no-undef
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
