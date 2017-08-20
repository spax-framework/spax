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

  it('should register returns', () => {
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
    })
  })

  it('should register resolved returns', () => {
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
    })
  })

  // should bypass falsy returns

  // should bypass rejected returns

  it('should register with register function', () => {
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
    })
  })

  describe('exception', () => {
    it('should NOT use root scope', () => {
      const { configure, use, run } = new SPAX()

      configure({
        scope: 'myapp'
      })

      use(() => ({
        options: {
          scope: 'myapp'
        }
      }))

      expect(run).to.throw(Error)
    })

    describe('production', () => {
      it('should NOT use root scope', () => {
        const { configure, use, run } = new SPAX()

        configure({
          scope: 'myapp'
        })

        use(() => ({
          options: {
            scope: 'myapp'
          }
        }))

        process.env.NODE_ENV = 'production'
        // TODO: 检查注册情况
        expect(run).to.not.throw(Error)
        process.env.NODE_ENV = 'developmemnt'
      })
    })
  })
})
