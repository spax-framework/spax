import createSPAX from 'src'

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
    const { use, run } = createSPAX({
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
    const { use, run } = createSPAX({
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

  describe('exception', () => {
    it('should NOT use root scope', () => {
      const { use, run } = createSPAX({
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
        const { use, run } = createSPAX({
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
