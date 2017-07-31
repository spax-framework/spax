import isPlainObject from 'lodash/isPlainObject'
import addPrefixToPath from '../../helpers/add-prefix'

export default {
  install (Vue) {
    /**
     * 因为模块内可能直接调用修改前的路由，
     * 所以需要提供一个自定义方法以确保可以跳转到添加了 prefixes 的路由。
     * @todo 支持命名路由
     */
    Vue.prototype.$redirect = function (location, replace) {
      let realPath

      if (isPlainObject(location)) {
        realPath = { ...location }

        const { path, prefix } = realPath

        if (path !== undefined) {
          // 如果提供了 prefix，说明是跳转到其它模块定义的路由
          // 跨模块跳转，现在只支持一级
          realPath.path = addPrefixToPath(prefix ? [prefix] : this.$prefixes, path)
        }
      } else {
        realPath = addPrefixToPath(this.$prefixes, location)
      }

      replace ? this.$router.replace(realPath) : this.$router.push(realPath)
    }
  }
}
