import SPAX from 'spax'

describe('register', () => {
  beforeEach(() => {
    const el = document.createElement('div')
    el.id = 'app'
    document.body.appendChild(el)
  })

  afterEach(() => {
    try {
      document.getElementById('app').remove()
    } catch (e) {
    }
  })

  it('should register returns', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp'
    })

    use(({ prefix }, options) => {
      return [{
        store: {
          state: {
            sync: prefix
          }
        },
        options
      }, ({ store }) => {
        expect(store.state.mymod.sync).to.equal('myapp')
      }]
    }, {
      scope: 'mymod'
    })

    run(({ store }) => {
      expect(store.state.mymod.sync).to.equal('myapp')
      done()
    })
  })

  it('should register resolved returns', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp'
    })

    use(async ({ prefix }, options) => {
      return await [{
        store: {
          state: {
            sync: prefix
          }
        },
        options
      }, ({ store }) => {
        expect(store.state.mymod.sync).to.equal('myapp')
      }]
    }, {
      scope: 'mymod'
    })

    run(({ store }) => {
      expect(store.state.mymod.sync).to.equal('myapp')
      done()
    })
  })

  // should bypass falsy returns

  // should bypass rejected returns

  it('should register with register function', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp'
    })

    use(({ prefix }, options, register) => {
      register({
        store: {
          state: {
            sync: prefix
          }
        },
        options
      }, ({ store }) => {
        expect(store.state.mymod.sync).to.equal('myapp')
      })
    }, {
      scope: 'mymod'
    })

    run(({ store }) => {
      expect(store.state.mymod.sync).to.equal('myapp')
      done()
    })
  })
})
