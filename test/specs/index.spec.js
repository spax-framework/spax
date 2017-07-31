import { configure, use, run } from '../../index.js'

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

  it('should configure', () => {
    expect(configure).to.be.a('function')
    configure({
      prefix: 'myapp'
    })
  })

  it('should use and run', done => {
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
      done()
    })
  })

  it('should call run only once', () => {
    expect(run).to.throw(Error)
  })
})
