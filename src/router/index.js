import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'

const Dashboard = () => import('../views/Dashboard.vue')
const Cars = () => import('../views/Cars.vue')
const CarModels = () => import('../views/CarModels.vue')
const NotFound = () => import('../views/404.vue')

Vue.use(VueRouter)

function authGuard(to, from, next) {
  let isAuthenticated = false;
  if (localStorage.getItem('token')) {
    isAuthenticated = true;
  }

  if (isAuthenticated) {
    next();
  } else {
    next({ name: 'Login' })
  }
}

function guestGuard(to, from, next) {
  let isAuthenticated = false;
  if (localStorage.getItem('token')) {
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    next();
  } else {
    next({ name: 'Dashboard' })
  }
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: guestGuard
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        component: Cars
      },
      {
        path: 'cars/:id',
        component: CarModels
      },
    ],
    beforeEnter: authGuard
  },
  {
    path: '*',
    name: '404',
    component: NotFound,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
