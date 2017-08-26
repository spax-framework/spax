import { configure, use, run } from 'spax'

import logger from 'modules/logger'
import persist from 'modules/persist'
import i18n from 'modules/i18n'
import validator from 'modules/validator'
import todo from 'modules/todo'

import Root from './views/root'
import translations from 'static/i18n/zh.json'

/**
 * 全局配置
 */
configure({
  // 项目名称
  name: 'TODO',
  // 项目版本号
  version: '1.0',
  // 系统自动将 component 挂载到 element
  element: '#app',
  component: Root
})

/**
 * Use Modules
 */

/**
 * 调试相关
 */
if (process.env.NODE_ENV !== 'production') {
  use(logger)
}

/**
* 国际化
*/
use(i18n, { translations })

/**
* 数据校验
*/
use(validator)

/**
 * TODO
 */
use(todo, { prefix: '/' })

/**
 * 持久化
 */
use(persist)

/**
 * Run Modules
 */

run(({ router }) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('%c[TODO] %cLet\'s go!',
      'font-weight: bold', 'color: green; font-weight: bold')
  }
})
