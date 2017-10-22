import { Store } from 'vuex'
import isFunction from 'lodash/isFunction'
import createContext, { createStore, createRouter } from './context'
import addPrefixToPath from './helpers/add-prefix'
import injectOptionsToComponent from './helpers/inject-options'
import analyseMap from './helpers/analyse-map'
import { log, warn, error } from './shared/log'

export default function create (): SPAX {
  /**
   * 上下文，用于储存全局数据
   * 这里使用 Vue 实例的一个好处是可以直接使用 Vue 的一些特性，比如事件订阅
   */
  const context: Context = createContext({
    // 全局配置项
    name: 'SPAX',
    version: '0.1.0',
    element: '#app',
    component: null,
    scope: 'app',
    prefix: '/',

    // Vuex.Store
    // store: null,

    // Vue-Router
    // router: null,

    // for Vue-Router
    routes: [],
  })

  const { Vue } = context

  /**
   * 全局配置
   */
  function configure (options: object) {
    Object.assign(context, options)
  }

  function mountComponentToElement () {
    const { router, store, scope, prefix, element, component } = context
    const vm = new Vue({ router, store, scope, prefix, ...component })
    // attach root vm to context
    context.vm = vm
    vm.$mount(element)
    context.mounted = true
    context.$emit('mounted')
  }

  /**
   * middlewares
   */
  const middlewares: Middleware[] = []

  /**
   * 注册模块
   * @example
   * use(core, { // 提供自定义的模块配置，将覆盖模块默认配置
   *   scope: 'core', // 指定 store 数据存储的命名空间，可通过 vm.$store.state.core 访问
   *   prefix: 'core'  // 指定路由 path 前缀，默认 `/`
   * })
   */
  function use (creator: Creator, options: object = Object.create(null) ) {
    if (isFunction(creator)) {
      middlewares.push({ creator, options })
    } else {
      if (process.env.NODE_ENV !== 'production') {
        error('`creator` must be a function.')
      }
    }
  }

  let isRun: boolean = false

  /**
   * 加载模块
   * 按正序依次处理模块注册的数据，
   * 完成后逆序执行模块注册的回调
   */
  function run (finale: Finale) {
    if (isRun) {
      if (process.env.NODE_ENV !== 'production') {
        error('should `run` only once.')
      }
      // 不允许多次执行
      return
    }

    isRun = true

    const total = middlewares.length
    let sofar = 0

    let scopeIndex: number = Date.now()

    // 初始化 Vuex Store
    const store: Store<any> = createStore(context)

    if (process.env.NODE_ENV !== 'production') {
      log('Registering modules...')
    }

    const callbacks: CBObj[] = []

    const { prefix: globalPrefix, routes } = context

    function registerModule (scope: string, obj: {
      namespaced?: boolean
    }) {
      // 直接使用 vuex 2.1.1 的 namespaced 特性
      obj.namespaced = obj.namespaced !== false

      // 动态注册
      store.registerModule(scope, obj)
    }

    function registerPlugins (scope: string, arr: object[]) {
      arr.forEach((plugin: (store: any, scope: string) => void) => plugin(store, scope))
    }

    function registerRoutes (scope: string, prefix: string, _routes: object[]) {
      // 将 scope 添加到 vm.$options
      // 将 prefix 添加到 vm.$options
      function injectOptions (component: {
        super?: any
      }, injection: object) {
        if (isFunction(component)) {
          if (process.env.NODE_ENV !== 'production') {
            if (component.super && component.super === Vue) {
              error('Please use Single File Components. See: https://vuejs.org/v2/guide/single-file-components.html.')
            }
          }
          return () => component().then((component: object) => injectOptionsToComponent(component, injection))
        } else {
          return injectOptionsToComponent(component, injection)
        }
      }

      // 添加 `prefix` 到路由的 `path` 参数
      function handleRoutes (prefixes: string[], r: object[]): object[] {
        return r.map((r: {
          path?: string
          redirect?: string
          alias?: string
          component?: any
          components?: {
            [key: string]: any
          }
          children: object[]
        }) => {
          const { path = '', redirect, alias, component, components, children } = r

          r.path = addPrefixToPath(prefixes, path)

          // 转换重定向
          if (redirect !== undefined) {
            r.redirect = addPrefixToPath(prefixes, redirect)
          }

          // 转换别名
          if (alias !== undefined) {
            r.alias = addPrefixToPath(prefixes, alias)
          }

          // inject component and components
          const injection = { scope, prefixes }

          if (component) {
            r.component = injectOptions(component, injection)
          }

          if (components) {
            Object.keys(components).forEach((key: string) => {
              components[key] = injectOptions(components[key], injection)
            })
          }

          // 递归处理子路由
          if (children) {
            r.children = handleRoutes(prefixes.concat(path), r.children)
          }

          return r
        })
      }

      // 处理路由配置，默认添加全局前缀
      routes.push.apply(routes, handleRoutes([[globalPrefix, prefix].join('/')], _routes))
    }

    function register (data?: Data, callback?: CBFunc) {
      if (data) {
        // 进行 store 与 router 相关处理
        const { options = Object.create(null), store, plugins, routes } = data

        let { scope, prefix } = options

        if (scope === context.scope) {
          if (process.env.NODE_ENV !== 'production') {
            error(`Scope ${scope} is protected.`)
          }
        } else {
          if (!prefix) {
            prefix = scope || '/'
          }

          if (!scope) {
            scope = `__${++scopeIndex}`
          }

          if (process.env.NODE_ENV !== 'production') {
            log(`Module ${scope} registered.`)
          }

          store && registerModule(scope, store)
          routes && registerRoutes(scope, prefix, routes)
          plugins && registerPlugins(scope, plugins)
          if (callback) {
            // 将回调函数添加到队列
            callbacks.push([callback, scope])
            callback = undefined
          }
        }
      }

      if (callback) {
        // 将回调函数添加到队列
        callbacks.push([callback, context.scope])
      }

      if (++sofar === total) {
        done()
      }

      // next()
    }

    function done () {
      if (process.env.NODE_ENV !== 'production') {
        log('Executing module callbacks')
      }

      // 模块注册完成后，初始化路由，以避免重定向提前发生
      const router = createRouter(context)

      // 判断是否挂载完毕
      function ensure (fn: () => void) {
        if (context.mounted) {
          fn()
        } else {
          context.$once('mounted', fn)
        }
      }

      // 执行模块注册的回调函数队列
      callbacks.forEach(([callback, _scope]) => callback({
        dispatch (type: string, payload: any) {
          ensure(() => {
            const { scope, value } = analyseMap(type, _scope || context.scope)
            store.dispatch(`${scope}/${value}`, payload)
          })
        },
        subscribe (prop: string, handler: Function) {
          ensure(() => {
            const { scope, value } = analyseMap(prop, _scope || context.scope)
            // 复用根 Vm
            context.vm.$watch(`$store.state.${scope}.${value}`, handler)
            handler(context.vm.$store.state[scope][value], true)
          })
        },
        store,
        router
      }))

      // 挂载
      mountComponentToElement()

      if (finale) {
        finale(context)
      }
    }

    // 执行模块队列
    middlewares.forEach(({ creator, options }) => {
      // 支持异步，但是尽量不要使用，以免阻塞其它模块的加载
      // @example
      // creator: fn(context, options)
      const ret = creator(context, options)
      if (ret) {
        // Promise
        if (isFunction(ret.then)) {
          ret
            .then((ret: any) => register.apply(null, Array.isArray(ret) ? ret : [ret]))
            .catch((e: any) => {
              if (process.env.NODE_ENV !== 'production') {
                warn(e)
              }
              // 无可注册
              register()
            })
        } else {
          register.apply(null, Array.isArray(ret) ? ret : [ret])
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          log(`Module ${creator} return falsy value: ${ret}`)
        }
        // 无可注册
        register()
      }
    })
  }

  return {
    context,
    middlewares,
    configure,
    use,
    run
  }
}
