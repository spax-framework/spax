var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import isPlainObject from 'lodash/isPlainObject';
import addPrefixToPath from '../../helpers/add-prefix';
export default {
    install: function (Vue) {
        /**
         * 因为模块内可能直接调用修改前的路由，
         * 所以需要提供一个自定义方法以确保可以跳转到添加了 prefixes 的路由。
         * @todo 支持命名路由
         */
        Vue.prototype.$redirect = function (location, replace) {
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
