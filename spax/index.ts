import Vue from 'vue'
import isFunction from 'lodash/isFunction'
import createContext, { createStore, createRouter } from './context'
import addPrefixToPath from './helpers/add-prefix'
import injectOptionsToComponent from './helpers/inject-options'
import analyseMap from './helpers/analyse-map'
import { log, warn, error } from './shared/log'

export default function SPAX () {
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
    routes: []
  })

  const { Vue } = context

  /**
   * 全局配置
   */
  function configure (options) {
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
   * @type {Array}
   */
  const middlewares = []

  /**
   * 注册模块
   * @example
   * use(core, { // 提供自定义的模块配置，将覆盖模块默认配置
   *   scope: 'core', // 指定 store 数据存储的命名空间，可通过 vm.$store.state.core 访问
   *   prefix: 'core'  // 指定路由 path 前缀，默认 `/`
   * })
   */
  function use (creator, options) {
    if (isFunction(creator)) {
      middlewares.push({ creator, options })
    } else {
      if (process.env.NODE_ENV !== 'production') {
        error('`creator` must be a function.')
      }
    }
  }

  let isRun = false

  /**
   * 加载模块
   * 按正序依次处理模块注册的数据，
   * 完成后逆序执行模块注册的回调
   */
  function run (finale) {
    if (isRun) {
      if (process.env.NODE_ENV !== 'production') {
        error('should `run` only once.')
      }
      // 不允许多次执行
      return
    }

    isRun = true

    let scopeIndex = Date.now()

    // 初始化 Vuex Store
    const store = createStore(context)

    if (process.env.NODE_ENV !== 'production') {
      log('Registering modules...')
    }

    const callbacks = []

    const { prefix: globalPrefix, routes } = context

    function registerModule (scope, obj) {
      // 直接使用 vuex 2.1.1 的 namespaced 特性
      obj.namespaced = obj.namespaced !== false

      // 动态注册
      store.registerModule(scope, obj)
    }

    function registerPlugins (scope, arr) {
      arr.forEach(plugin => plugin(store, scope))
    }

    function registerRoutes (scope, prefix, _routes) {
      // 将 scope 添加到 vm.$options
      // 将 prefix 添加到 vm.$options
      function injectOptions (component, injection) {
        if (isFunction(component)) {
          if (process.env.NODE_ENV !== 'production') {
            if (component.super && component.super === Vue) {
              error('Please use Single File Components. See: https://vuejs.org/v2/guide/single-file-components.html.')
            }
          }
          return () => component().then(component => injectOptionsToComponent(component, injection))
        } else {
          return injectOptionsToComponent(component, injection)
        }
      }

      // 添加 `prefix` 到路由的 `path` 参数
      function handleRoutes (prefixes, r) {
        return r.map(r => {
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
            Object.keys(components).forEach(key => {
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

    function register (data, callback) {
      if (isFunction(data)) {
        callback = data
        data = null
      }

      if (data) {
        // 进行 store 与 router 相关处理
        const { options = Object.create(null), store, plugins, routes } = data

        let { scope, prefix } = options

        if (scope === context.scope) {
          if (process.env.NODE_ENV !== 'production') {
            error(`Scope ${scope} is protected.`)
          }
          // 直接调用下一个
          return next()
        }

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
        callback && Object.assign(callback, { scope })
      }

      if (callback) {
        // 将回调函数添加到队列
        callbacks.push(callback)
      }

      next()
    }

    function done () {
      if (process.env.NODE_ENV !== 'production') {
        log('Executing module callbacks')
      }
      // 模块注册完成后，初始化路由，以避免重定向提前发生
      const router = createRouter(context)

      // 判断是否挂载完毕
      function ensure (fn) {
        if (context.mounted) {
          fn()
        } else {
          context.$once('mounted', fn)
        }
      }

      // 执行模块注册的回调函数队列
      callbacks.forEach(callback => callback({
        dispatch (type, payload) {
          ensure(() => {
            const { scope, value } = analyseMap(type, callback.scope || context.scope)
            store.dispatch(`${scope}/${value}`, payload)
          })
        },
        subscribe (prop, handler) {
          ensure(() => {
            const { scope, value } = analyseMap(prop, callback.scope || context.scope)
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

    function next () {
      const middleware = middlewares.shift()

      if (middleware) {
        const { creator, options } = middleware

        // 函数形式参数长度为 3
        if (creator.length === 3) {
          let isRegistered = false
          // 使用回调
          // @example
          // creator: fn(context, options, register)
          creator(context, options, (...args) => {
            if (isRegistered) {
              if (process.env.NODE_ENV !== 'production') {
                error('should `register` only once.')
              }
            } else {
              isRegistered = true
              register.apply(null, args)
            }
          })
        } else {
          // 支持异步，但是尽量不要使用，以免阻塞其它模块的加载
          // @example
          // creator: fn(context, options)
          const ret = creator(context, options)
          if (ret) {
            // Promise
            if (typeof ret.then === 'function') {
              ret
                .then(ret => register.apply(null, Array.isArray(ret) ? ret : [ret]))
                .catch(e => {
                  if (process.env.NODE_ENV !== 'production') {
                    warn(e)
                  }
                  // 无可注册，将会直接 next
                  register()
                })
            } else {
              register.apply(null, Array.isArray(ret) ? ret : [ret])
            }
          } else {
            if (process.env.NODE_ENV !== 'production') {
              log(`Module ${creator} return falsy value: ${ret}`)
            }
            // 无可注册，将会直接 next
            register()
          }
        }
      } else {
        // 注册完毕
        done()
      }
    }

    // 执行模队列
    next()
  }

  return {
    context,
    middlewares,
    configure,
    use,
    run
  }
}
