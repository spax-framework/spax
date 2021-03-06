import createSPAX from 'src'

describe('register.plugins', () => {
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

  it('should handle plugins', done => {
    const { use, run } = createSPAX()
    use(context => {
      return {
        plugins: [store => {
          expect(context.store).to.equal(store)
          done()
        }]
      }
    })
    run()
  })
})
