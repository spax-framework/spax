// import Vue from "vue"
// import { Store } from 'vuex'
// import Router, { RouteConfig } from 'vue-router'

// declare module "*.vue" {
//   import Vue from "vue"
//   export default Vue
// }

// declare function Creator (): void

interface SPAX {
  context: Context
  middlewares: Middleware[]
  configure: (options: object) => void
  use: (creator: Creator, options: object) => void
  run: (finale?: Finale) => void
}

interface ContextOptions {
  name?: string
  version?: string
  element?: string
  component?: any
  scope?: string
  prefix?: string
  modules?: object
  plugins?: object
  routes: object[]
}

interface Context extends ContextOptions {
  scope: string
  Vue: any
  store: any
  router: any
  vm: {
    $watch: Function
    $store: {
      [key: string]: any
      state: {
        [scope: string]: {
          [key: string]: any
        }
      }
    }
  }
  mounted: boolean
  $emit: Function
  $on: Function
  $off: Function
  $once: Function
}

interface Middleware {
  creator: Creator
  options: object
}

interface Data {
  options?: object
  store?: object
  plugins?: Function[]
  routes?: object[]
}

interface ValueMap  {
  scope: string
  value: string
  alias: string
}

declare type CBFunc = (payload: {
  dispatch: (type: string, payload: any) => void
  subscribe: (prop: string, handler: Function) => void
  store: any
  router: any
}) => any
declare type CBObj = [CBFunc, string]
declare type Creator = (context: Context, options: object) => any
declare type Finale = (context: Context) => any
declare type Register = (data?: object, callback?: CBFunc) => any


// interface ContextOptions {
//   name?: string
//   version?: string
//   element?: string
//   component?: Vue
//   scope?: string
//   prefix?: string
//   modules?: object
//   plugins?: object
//   routes?: RouteConfig[]
// }

// interface Context extends Vue, ContextOptions {
//   store?: Store<any>
//   router?: Router
//   Vue?: Vue
//   vm: Vue
//   mounted: boolean
// }
