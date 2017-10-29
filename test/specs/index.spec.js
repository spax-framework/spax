import createSPAX from 'src'
import * as log from 'src/shared/log'

const { context, use, run } = createSPAX({
  prefix: 'myapp'
})

describe('SPAX', () => {
  before(() => {
    const el = document.createElement('div')
    el.id = 'app'
    document.body.appendChild(el)
  })

  after(() => {
    try {
      document.getElementById('app').remove()
    } catch (e) {
    }
  })

  it('should have context', () => {
    expect(context).to.be.an('object')
    expect(Object.keys(context)).to.include(
      'name', 'version', 'element', 'component', 'scope', 'prefix', 'routes', 'Vue'
    )
  })

  it('should use and run', () => {
    use(({ prefix }, options) => {
      return [{
        store: {
          state: {
            single: prefix
          }
        },
        options
      }, ({ store }) => {
        expect(store.state.mymod.single).to.equal('myapp')
      }]
    }, {
      scope: 'mymod'
    })
    run(({ store }) => {
      expect(store.state.mymod.single).to.equal('myapp')
    })
  })

  it('should run only once', () => {
    sinon.spy(log, 'error')
    expect(run).to.throw(Error)
    assert(log.error.callCount === 1)
    process.env.NODE_ENV = 'production'
    // should NOT throw Error in production
    expect(run).to.not.throw(Error)
    assert(log.error.callCount === 1)
    process.env.NODE_ENV = 'development'
    log.error.restore()
  })
})
