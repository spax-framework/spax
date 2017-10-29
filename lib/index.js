/*!
 * SPAX v1.0.0-alpha
 * (c) 2017 crossjs
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isFunction = _interopDefault(require('lodash/isFunction'));
var Vue = _interopDefault(require('vue'));
var vuexRouterSync = require('vuex-router-sync');
var Router = _interopDefault(require('vue-router'));
var Vuex = require('vuex');
var Vuex__default = _interopDefault(Vuex);
var isPlainObject = _interopDefault(require('lodash/isPlainObject'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

Vue.use(Router);
var createVueRouter = function (routes) {
    return new Router({ routes: routes });
};

Vue.use(Vuex__default);
var createVuexStore = function (modules, plugins) {
    return new Vuex.Store({
        strict: process.env.NODE_ENV === 'development',
        plugins: plugins,
        modules: modules
    });
};

/**
 * 解析 getter、actions、state，支持别名和模块名
 */
function analyseMap(value, scope) {
    var alias = value;
    /**
     * 解析 scope/value 格式
     *   'scope/value' -> ['scope', 'value']
     *   'scope/value as value1' -> ['scope', 'value as value1']
     */
    var scopeAndValue = value.split('/');
    if (scopeAndValue.length === 2) {
        scope = scopeAndValue[0];
        alias = value = scopeAndValue[1];
    }
    /**
     * 解析 as 别名
     *   'value as value1' -> ['value', 'value1']
     */
    var valueAndAlias = value.split(/\s+as\s+/);
    if (valueAndAlias.length === 2) {
        value = valueAndAlias[0];
        alias = valueAndAlias[1];
    }
    return { scope: scope, value: value, alias: alias };
}

var log = function log(msg) {
    console.log("[SPAX] " + msg);
};
var warn = function warn(msg) {
    console.error("[SPAX warn] " + msg);
};
var error = function error(msg) {
    throw new Error("[SPAX error] " + msg);
};

var map = {
    install: function (Vue$$1) {
        /**
         * 注册生命周期 `beforeCreate` 函数
         * 进行 mapState/mapGetters/mapMutation s 数据处理
         * !!! 此处的 map*** 不同于 vuex 的 map***，作用类似，用法不同
         */
        Vue$$1.mixin({
            beforeCreate: function () {
                var _this = this;
                var _a = this.$options, scope = _a.scope, prefixes = _a.prefixes, parent = _a.parent, _b = _a.methods, methods = _b === void 0 ? Object.create(null) : _b, _c = _a.computed, computed = _c === void 0 ? Object.create(null) : _c, mapState = _a.mapState, mapGetters = _a.mapGetters, mapActions = _a.mapActions, mapMutations = _a.mapMutations;
                // scope injection
                if (scope) {
                    this.$scope = scope;
                }
                else if (parent && parent.$scope) {
                    this.$scope = parent.$scope;
                }
                // prefixes injection
                if (prefixes) {
                    this.$prefixes = prefixes;
                }
                else if (parent && parent.$prefixes) {
                    this.$prefixes = parent.$prefixes;
                }
                if (mapState) {
                    /**
                     * 将 mapState 转成 computed
                     * @example
                     * // 映射当前 scope 的 state 里的值
                     * mapState: ['value1', 'value2']
                     * // 映射指定 scope 的 state 里的值
                     * mapState: ['scope1/value1', 'scope2/value2']
                     * // 设置别名, 区别不同 scope 的 state
                     * mapState: ['scope1/value1', 'scope2/value1 as value2']
                     */
                    if (Array.isArray(mapState)) {
                        mapState.forEach(function (value) {
                            var _a = analyseMap(value, _this.$scope), _alias = _a.alias, _scope = _a.scope, _value = _a.value;
                            computed[_alias] = function mappedState() {
                                return this.$store.state[_scope][_value];
                            };
                        });
                    }
                    else {
                        if (process.env.NODE_ENV !== 'production') {
                            warn('mapState must be an array: ' + JSON.stringify(mapState));
                        }
                    }
                }
                if (mapGetters) {
                    /**
                     * 将 mapGetters 转成 computed
                     * @example
                     * // 映射当前 scope 的 getters 里的值
                     * mapGetters: ['value1', 'value2']
                     * // 映射指定 scope 的 getters 里的值
                     * mapGetters: ['scope1/value1', 'scope2/value2']
                     * // 设置别名, 区别不同 scope 的 getters
                     * mapGetters: ['scope1/value1', 'scope2/value1 as value2']
                     */
                    if (Array.isArray(mapGetters)) {
                        mapGetters.forEach(function (value) {
                            var _a = analyseMap(value, _this.$scope), _alias = _a.alias, _scope = _a.scope, _value = _a.value;
                            computed[_alias] = function mappedGetter() {
                                var _key = _scope + "/" + _value;
                                if (!(_key in this.$store.getters)) {
                                    if (process.env.NODE_ENV !== 'production') {
                                        warn('unknown getter: ' + value);
                                    }
                                }
                                return this.$store.getters[_key];
                            };
                        });
                    }
                    else {
                        if (process.env.NODE_ENV !== 'production') {
                            warn('mapGetters must be an array: ' + JSON.stringify(mapGetters));
                        }
                    }
                }
                if (mapActions) {
                    /**
                     * 将 mapActions 转成 methods
                     * @example
                     * // 映射当前 scope 的 actions 里的值
                     * mapActions: ['action1', 'action2']
                     * // 映射指定 scope 的 actions 里的值
                     * mapActions: ['scope1/action1', 'scope2/action2']
                     * // 设置别名, 区别不同 scope 的 actions
                     * mapGetters: ['scope1/action1', 'scope2/action1 as action2']
                     */
                    if (Array.isArray(mapActions)) {
                        mapActions.forEach(function (value) {
                            var _a = analyseMap(value, _this.$scope), _alias = _a.alias, _scope = _a.scope, _value = _a.value;
                            methods[_alias] = function mappedAction() {
                                var arguments$1 = arguments;

                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments$1[_i];
                                }
                                return (_a = this.$store).dispatch.apply(_a, [_scope + "/" + _value].concat(args));
                                var _a;
                            };
                        });
                    }
                    else {
                        if (process.env.NODE_ENV !== 'production') {
                            warn('mapActions must be an array: ' + JSON.stringify(mapActions));
                        }
                    }
                }
                if (mapMutations) {
                    /**
                     * 将 mapMutations 转成 methods
                     * @example
                     * // 映射当前 scope 的 mutations 里的值
                     * mapMutations: ['mutation1', 'mutation2']
                     * // 映射指定 scope 的 mutations 里的值
                     * mapMutations: ['scope1/mutation1', 'scope2/mutation2']
                     * // 设置别名, 区别不同 scope 的 mutations
                     * mapGetters: ['scope1/mutation1', 'scope2/mutation1 as mutation2']
                     */
                    if (Array.isArray(mapMutations)) {
                        mapMutations.forEach(function (value) {
                            var _a = analyseMap(value, _this.$scope), _alias = _a.alias, _scope = _a.scope, _value = _a.value;
                            methods[_alias] = function mappedMutation() {
                                var arguments$1 = arguments;

                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments$1[_i];
                                }
                                return (_a = this.$store).commit.apply(_a, [_scope + "/" + _value].concat(args));
                                var _a;
                            };
                        });
                    }
                    else {
                        if (process.env.NODE_ENV !== 'production') {
                            warn('mapMutations must be an array: ' + JSON.stringify(mapMutations));
                        }
                    }
                }
                Object.assign(this.$options, { computed: computed, methods: methods });
            }
        });
    }
};

/**
 * 将路由转成带前缀的绝对路由
 */
function addPrefixToPath(prefixes, path) {
    // 首字母为 `/`，则只取根 prefix
    var prefix = path.charAt(0) === '/' ? prefixes[0] : prefixes.join('/');
    return ("/" + prefix + "/" + path).replace(/\/+$/, '').replace(/\/\/+/g, '/') || '/';
}

var redirect = {
    install: function (Vue$$1) {
        /**
         * 因为模块内可能直接调用修改前的路由，
         * 所以需要提供一个自定义方法以确保可以跳转到添加了 prefixes 的路由。
         * @todo 支持命名路由
         */
        Vue$$1.prototype.$redirect = function (location, replace) {
            var realPath;
            if (isPlainObject(location)) {
                realPath = __assign({}, location);
                var path = realPath.path, prefix = realPath.prefix;
                if (path !== undefined) {
                    // 如果提供了 prefix，说明是跳转到其它模块定义的路由
                    // 跨模块跳转，现在只支持一级
                    realPath.path = addPrefixToPath(prefix ? [prefix] : this.$prefixes, path);
                }
            }
            else {
                realPath = addPrefixToPath(this.$prefixes, location);
            }
            replace ? this.$router.replace(realPath) : this.$router.push(realPath);
        };
    }
};

// returns Context
var createContext = function (props) {
    /**
     * Vue plugins
     */
    Vue.use(map);
    Vue.use(redirect);
    // create context
    return Object.assign(new Vue(), props, { Vue: Vue, mounted: false });
};
function createStore(context) {
    var modules = context.modules, plugins = context.plugins, router = context.router;
    // create store and router
    var store = context.store = createVuexStore(modules, plugins);
    // keep store and router in sync
    if (router) {
        vuexRouterSync.sync(store, router);
    }
    return store;
}
function createRouter(context) {
    var store = context.store, routes = context.routes;
    var router = context.router = createVueRouter(routes);
    // keep store and router in sync
    if (store) {
        vuexRouterSync.sync(store, router);
    }
    return router;
}

/**
 * 向组件 options 注入数据
 */
function injectOptionsToComponent(component, injection) {
    if (component) {
        Object.assign(component['default'] || component, injection);
    }
    return component;
}

function createSPAX(options) {
    /**
     * 上下文，用于储存全局数据
     * 这里使用 Vue 实例的一个好处是可以直接使用 Vue 的一些特性，比如事件订阅
     */
    var context = createContext(__assign({ 
        // 全局配置项
        name: 'SPAX', version: '0.1.0', element: '#app', component: null, scope: 'app', prefix: '/', 
        // Vuex.Store
        // store: null,
        // Vue-Router
        // router: null,
        // for Vue-Router
        routes: [] }, options));
    var Vue$$1 = context.Vue;
    function mountComponentToElement() {
        var router = context.router, store = context.store, scope = context.scope, prefix = context.prefix, element = context.element, component = context.component;
        var vm = new Vue$$1(__assign({ router: router, store: store, scope: scope, prefix: prefix }, component));
        // attach root vm to context
        context.vm = vm;
        vm.$mount(element);
        context.mounted = true;
        context.$emit('mounted');
    }
    /**
     * middlewares
     */
    var middlewares = [];
    /**
     * 注册模块
     * @example
     * use(core, { // 提供自定义的模块配置，将覆盖模块默认配置
     *   scope: 'core', // 指定 store 数据存储的命名空间，可通过 vm.$store.state.core 访问
     *   prefix: 'core'  // 指定路由 path 前缀，默认 `/`
     * })
     */
    function use(creator, options) {
        if (options === void 0) { options = Object.create(null); }
        if (isFunction(creator)) {
            middlewares.push({ creator: creator, options: options });
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                error('`creator` must be a function.');
            }
        }
    }
    var isRun = false;
    /**
     * 加载模块
     * 按正序依次处理模块注册的数据，
     * 完成后逆序执行模块注册的回调
     */
    function run(finale) {
        if (isRun) {
            if (process.env.NODE_ENV !== 'production') {
                error('should `run` only once.');
            }
            // 不允许多次执行
            return;
        }
        isRun = true;
        var total = middlewares.length;
        var sofar = 0;
        var scopeIndex = Date.now();
        // 初始化 Vuex Store
        var store = createStore(context);
        if (process.env.NODE_ENV !== 'production') {
            log('Registering modules...');
        }
        var callbacks = [];
        var globalPrefix = context.prefix, routes = context.routes;
        function registerModule(scope, obj) {
            // 直接使用 vuex 2.1.1 的 namespaced 特性
            obj.namespaced = obj.namespaced !== false;
            // 动态注册
            store.registerModule(scope, obj);
        }
        function registerPlugins(scope, arr) {
            arr.forEach(function (plugin) { return plugin(store, scope); });
        }
        function registerRoutes(scope, prefix, _routes) {
            // 将 scope 添加到 vm.$options
            // 将 prefix 添加到 vm.$options
            function injectOptions(component, injection) {
                if (isFunction(component)) {
                    if (process.env.NODE_ENV !== 'production') {
                        if (component.super && component.super === Vue$$1) {
                            error('Please use Single File Components. See: https://vuejs.org/v2/guide/single-file-components.html.');
                        }
                    }
                    return function () { return component().then(function (component) { return injectOptionsToComponent(component, injection); }); };
                }
                else {
                    return injectOptionsToComponent(component, injection);
                }
            }
            // 添加 `prefix` 到路由的 `path` 参数
            function handleRoutes(prefixes, r) {
                return r.map(function (r) {
                    var _a = r.path, path = _a === void 0 ? '' : _a, redirect = r.redirect, alias = r.alias, component = r.component, components = r.components, children = r.children;
                    r.path = addPrefixToPath(prefixes, path);
                    // 转换重定向
                    if (redirect !== undefined) {
                        r.redirect = addPrefixToPath(prefixes, redirect);
                    }
                    // 转换别名
                    if (alias !== undefined) {
                        r.alias = addPrefixToPath(prefixes, alias);
                    }
                    // inject component and components
                    var injection = { scope: scope, prefixes: prefixes };
                    if (component) {
                        r.component = injectOptions(component, injection);
                    }
                    if (components) {
                        Object.keys(components).forEach(function (key) {
                            components[key] = injectOptions(components[key], injection);
                        });
                    }
                    // 递归处理子路由
                    if (children) {
                        r.children = handleRoutes(prefixes.concat(path), r.children);
                    }
                    return r;
                });
            }
            // 处理路由配置，默认添加全局前缀
            routes.push.apply(routes, handleRoutes([[globalPrefix, prefix].join('/')], _routes));
        }
        function register(data, callback) {
            if (data) {
                // 进行 store 与 router 相关处理
                var _a = data.options, options_1 = _a === void 0 ? Object.create(null) : _a, store_1 = data.store, plugins = data.plugins, routes_1 = data.routes;
                var scope = options_1.scope, prefix = options_1.prefix;
                if (scope === context.scope) {
                    if (process.env.NODE_ENV !== 'production') {
                        error("Scope " + scope + " is protected.");
                    }
                }
                else {
                    if (!prefix) {
                        prefix = scope || '/';
                    }
                    if (!scope) {
                        scope = "__" + ++scopeIndex;
                    }
                    if (process.env.NODE_ENV !== 'production') {
                        log("Module " + scope + " registered.");
                    }
                    store_1 && registerModule(scope, store_1);
                    routes_1 && registerRoutes(scope, prefix, routes_1);
                    plugins && registerPlugins(scope, plugins);
                    if (callback) {
                        // 将回调函数添加到队列
                        callbacks.push([callback, scope]);
                        callback = undefined;
                    }
                }
            }
            if (callback) {
                // 将回调函数添加到队列
                callbacks.push([callback, context.scope]);
            }
            if (++sofar === total) {
                done();
            }
            // next()
        }
        function done() {
            if (process.env.NODE_ENV !== 'production') {
                log('Executing module callbacks');
            }
            // 模块注册完成后，初始化路由，以避免重定向提前发生
            var router = createRouter(context);
            // 判断是否挂载完毕
            function ensure(fn) {
                if (context.mounted) {
                    fn();
                }
                else {
                    context.$once('mounted', fn);
                }
            }
            // 执行模块注册的回调函数队列
            callbacks.forEach(function (_a) {
                var callback = _a[0], _scope = _a[1];
                return callback({
                    dispatch: function (type, payload) {
                        ensure(function () {
                            var _a = analyseMap(type, _scope || context.scope), scope = _a.scope, value = _a.value;
                            store.dispatch(scope + "/" + value, payload);
                        });
                    },
                    subscribe: function (prop, handler) {
                        ensure(function () {
                            var _a = analyseMap(prop, _scope || context.scope), scope = _a.scope, value = _a.value;
                            // 复用根 Vm
                            context.vm.$watch("$store.state." + scope + "." + value, handler);
                            handler(context.vm.$store.state[scope][value], true);
                        });
                    },
                    store: store,
                    router: router
                });
            });
            // 挂载
            mountComponentToElement();
            if (finale) {
                finale(context);
            }
        }
        // 执行模块队列
        middlewares.forEach(function (_a) {
            var creator = _a.creator, options = _a.options;
            // 支持异步，但是尽量不要使用，以免阻塞其它模块的加载
            // @example
            // creator: fn(context, options)
            var ret = creator(context, options);
            if (ret) {
                // Promise
                if (isFunction(ret.then)) {
                    ret
                        .then(function (ret) { return register.apply(null, Array.isArray(ret) ? ret : [ret]); })
                        .catch(function (e) {
                        if (process.env.NODE_ENV !== 'production') {
                            warn(e);
                        }
                        // 无可注册
                        register();
                    });
                }
                else {
                    register.apply(null, Array.isArray(ret) ? ret : [ret]);
                }
            }
            else {
                if (process.env.NODE_ENV !== 'production') {
                    log("Module " + creator + " return falsy value: " + ret);
                }
                // 无可注册
                register();
            }
        });
    }
    return {
        context: context,
        middlewares: middlewares,
        use: use,
        run: run
    };
}

module.exports = createSPAX;
