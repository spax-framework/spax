import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import map from './plugins/map'
import redirect from './plugins/redirect'
import createVuexStore from './creators/create-vuex-store'
import createVueRouter from './creators/create-vue-router'

export default props => {
  /**
   * Vue plugins
   */
  Vue.use(map)
  Vue.use(redirect)

  // create context
  return Object.assign(new Vue(), props, { Vue })
}

export function createStore (context) {
  const { modules, plugins, router } = context

  // create store and router
  const store = context.store = createVuexStore(modules, plugins)

  // keep store and router in sync
  if (router) {
    sync(store, router)
  }

  return store
}

export function createRouter (context) {
  const { store, routes } = context
  const router = context.router = createVueRouter(routes)

  // keep store and router in sync
  if (store) {
    sync(store, router)
  }

  return router
}
