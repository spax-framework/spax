/**
 * 向组件 options 注入数据
 */
export default function injectOptionsToComponent (component, injection) {
  if (component) {
    Object.assign(component, injection)
    if (process.env.NODE_ENV !== 'production') {
      const { _Ctor } = (component['default'] || component)
      if (_Ctor && _Ctor[0] && _Ctor[0].options) {
        Object.assign(_Ctor[0].options, injection)
      }
    }
  }
  return component
}
