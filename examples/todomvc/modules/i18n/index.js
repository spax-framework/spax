import template from 'string-template'
import createStore from './create-store'

export default ({ Vue, store }, options = {}) => {
  options = {
    scope: 'i18n',
    lang: (navigator.language || navigator.browserLanguage).toLowerCase().split('-')[0],
    translations: {},
    ...options
  }

  const {
    scope,
    fallbackLang = 'zh',
    urlPattern = './i18n/{lang}.json'
  } = options

  function parseKeys (keys, scope) {
    switch (keys.indexOf('/')) {
      case 0: // 以 `/` 开头，说明是从全局里查找匹配
        console.warn('[I18N] 斜杠开头的规则已废弃，请直接使用`scope/k.e.y.s`')
        const arr1 = keys.split('.')
        return {
          scope: arr1[0].slice(1),
          keyArray: arr1.slice(1)
        }
      case -1:
        return {
          scope,
          keyArray: keys.split('.')
        }
      default:
        const arr2 = keys.match(/(^\w+)\/(.+$)/)
        return {
          scope: arr2[1],
          keyArray: arr2[2].split('.')
        }
    }
  }

  /**
   * 为了支持 filter
   * @example
   * {{ key | capitalize | __($scope) }}
   */
  Vue.filter('__', function (keys, $scope) {
    return Vue.prototype.__.call({
      $scope,
      $store: store
    }, keys)
  })

  /**
   * I18n
   */
  Vue.prototype.__ = Vue.prototype.$translate = function (keys, ...args) {
    if (!keys) {
      return keys
    }

    const parsed = parseKeys(keys, this.$scope)

    const { translations } = this.$store.state[scope]

    // keys 以 `.` 作为分隔符
    return template(parsed.keyArray.reduce((res, key) => {
      if (res && typeof res === 'object' && res.hasOwnProperty(key)) {
        return res[key]
      }
      return keys
    }, parsed.scope ? translations[parsed.scope] : translations), ...args)
  }

  return [{
    store: createStore(options),
    options
  }, ({ dispatch, subscribe }) => {
    let fallbackEnabled = false

    function fetchTranslations (lang) {
      // add `dir="..."` to `<html>`
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      // request json data
      fetch(template(urlPattern, { lang }))
        .then(response => response.json())
        .then(translations => dispatch('setI18n', { translations }))
        .catch(() => {
          if (fallbackEnabled) {
            // 确保只执行一次，避免无限循环
            fallbackEnabled = false
            fetchTranslations(fallbackLang)
          }
        })
    }

    // vm for watching i18n
    subscribe('lang', lang => {
      fallbackEnabled = true
      fetchTranslations(lang)
    })
  }]
}
