import analyseMap from '../../helpers/analyse-map'
import { warn } from '../../shared/log'

export default {
  install (Vue: any) {
    /**
     * 注册生命周期 `beforeCreate` 函数
     * 进行 mapState/mapGetters/mapMutation s 数据处理
     * !!! 此处的 map*** 不同于 vuex 的 map***，作用类似，用法不同
     */
    Vue.mixin({
      beforeCreate () {
        const {
          scope,
          prefixes,
          parent,
          methods = Object.create(null),
          computed = Object.create(null),
          mapState,
          mapGetters,
          mapActions,
          mapMutations
        } = this.$options

        // scope injection
        if (scope) {
          this.$scope = scope
        } else if (parent && parent.$scope) {
          this.$scope = parent.$scope
        }

        // prefixes injection
        if (prefixes) {
          this.$prefixes = prefixes
        } else if (parent && parent.$prefixes) {
          this.$prefixes = parent.$prefixes
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
            mapState.forEach(value => {
              const { alias: _alias, scope: _scope, value: _value } = analyseMap(value, this.$scope)
              computed[_alias] = function mappedState () {
                return this.$store.state[_scope][_value]
              }
            })
          } else {
            if (process.env.NODE_ENV !== 'production') {
              warn('mapState must be an array: ' + JSON.stringify(mapState))
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
            mapGetters.forEach(value => {
              const { alias: _alias, scope: _scope, value: _value } = analyseMap(value, this.$scope)

              computed[_alias] = function mappedGetter () {
                const _key = `${_scope}/${_value}`
                if (!(_key in this.$store.getters)) {
                  if (process.env.NODE_ENV !== 'production') {
                    warn('unknown getter: ' + value)
                  }
                }
                return this.$store.getters[_key]
              }
            })
          } else {
            if (process.env.NODE_ENV !== 'production') {
              warn('mapGetters must be an array: ' + JSON.stringify(mapGetters))
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
            mapActions.forEach(value => {
              const { alias: _alias, scope: _scope, value: _value } = analyseMap(value, this.$scope)
              methods[_alias] = function mappedAction (...args: any[]) {
                return this.$store.dispatch(`${_scope}/${_value}`, ...args)
              }
            })
          } else {
            if (process.env.NODE_ENV !== 'production') {
              warn('mapActions must be an array: ' + JSON.stringify(mapActions))
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
            mapMutations.forEach(value => {
              const { alias: _alias, scope: _scope, value: _value } = analyseMap(value, this.$scope)
              methods[_alias] = function mappedMutation (...args: any[]) {
                return this.$store.commit(`${_scope}/${_value}`, ...args)
              }
            })
          } else {
            if (process.env.NODE_ENV !== 'production') {
              warn('mapMutations must be an array: ' + JSON.stringify(mapMutations))
            }
          }
        }

        Object.assign(this.$options, { computed, methods })
      }
    })
  }
}
