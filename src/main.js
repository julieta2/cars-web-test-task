import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

// import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify'

import router from './router'

window.axios = require('axios')

Vue.use(VueRouter)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
