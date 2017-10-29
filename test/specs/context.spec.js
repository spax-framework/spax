import createContext, { createStore, createRouter } from 'src/context'

describe('context', () => {
  describe('creation flow: 1', () => {
    const context = createContext()

    it('should have messagebus', () => {
      expect(context.$on).to.be.a('function')
      expect(context.$off).to.be.a('function')
      expect(context.$once).to.be.a('function')
      expect(context.$emit).to.be.a('function')
    })

    it('should have store', () => {
      expect(context.store).to.be.undefined
      createStore(context)
      expect(context.store).to.be.a('object')
    })

    it('should have router', () => {
      expect(context.router).to.be.undefined
      createRouter(context)
      expect(context.router).to.be.a('object')
    })
  })

  describe('creation flow: 2', () => {
    const context = createContext()

    it('should have messagebus', () => {
      expect(context.$on).to.be.a('function')
      expect(context.$off).to.be.a('function')
      expect(context.$once).to.be.a('function')
      expect(context.$emit).to.be.a('function')
    })

    it('should have router', () => {
      expect(context.router).to.be.undefined
      createRouter(context)
      expect(context.router).to.be.a('object')
    })

    it('should have store', () => {
      expect(context.store).to.be.undefined
      createStore(context)
      expect(context.store).to.be.a('object')
    })
  })
})
