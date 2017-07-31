import createContext, { createStore, createRouter } from 'spax/context'

describe('context', () => {
  const context = createContext()

  describe('createContext', () => {
    it('should have messagebus', () => {
      assert(typeof context.$on === 'function')
      assert(typeof context.$off === 'function')
      assert(typeof context.$once === 'function')
      assert(typeof context.$emit === 'function')
    })
  })

  describe('createStore', () => {
    it('should have store', () => {
      assert(createStore(context) === context.store)
    })
  })

  describe('createRouter', () => {
    it('should have router', () => {
      assert(createRouter(context) === context.router)
    })
  })
})
