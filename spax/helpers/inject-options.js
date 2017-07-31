/**
 * 向组件 options 注入数据
 */
export default function injectOptionsToComponent (component, injection) {
  if (component) {
    if (process.env.NODE_ENV === 'production') {
      Object.assign(component, injection)
    } else {
      const { _Ctor } = component
      if (_Ctor && _Ctor[0] && _Ctor[0].options) {
        Object.assign(_Ctor[0].options, injection)
      }
    }
  }
  return component
}
