/**
 * 向组件 options 注入数据
 */
export default function injectOptionsToComponent (component: any, injection: object): any {
  if (component) {
    Object.assign(component['default'] || component, injection)
  }
  return component
}
