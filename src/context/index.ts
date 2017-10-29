import Vue from 'vue'
import Router from 'vue-router'
import { Store } from 'vuex'
import { sync } from 'vuex-router-sync'
import createVueRouter from './creators/create-vue-router'
import createVuexStore from './creators/create-vuex-store'
import map from './plugins/map'
import redirect from './plugins/redirect'

// returns Context
export default (props: ContextOptions): any => {
  /**
   * Vue plugins
   */
  Vue.use(map)
  Vue.use(redirect)

  // create context
  return Object.assign(new Vue(), props, { Vue, mounted: false })
}

export function createStore (context: Context): Store<any> {
  const { modules, plugins, router } = context

  // create store and router
  const store = context.store = createVuexStore(modules, plugins)

  // keep store and router in sync
  if (router) {
    sync(store, router)
  }

  return store
}

export function createRouter (context: Context): Router {
  const { store, routes } = context
  const router = context.router = createVueRouter(routes)

  // keep store and router in sync
  if (store) {
    sync(store, router)
  }

  return router
}
