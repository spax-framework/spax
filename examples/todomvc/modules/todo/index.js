import createStore from './create-store'
import createRoutes from './create-routes'

export default (context, options = {}) => {
  options = { scope: 'todo', prefix: 'todo', ...options }

  return {
    store: createStore(context, options),
    routes: createRoutes(context, options),
    options
  }
}
