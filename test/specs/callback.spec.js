import createSPAX from 'src'

describe('callback', () => {
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

  it('should have dispatch and subscribe', () => {
    const { use, run } = createSPAX()
    use(() => {
      return ({ dispatch, subscribe }) => {
        expect(dispatch).to.be.a('function')
        expect(subscribe).to.be.a('function')
      }
    })
    run()
  })

  it('should add scrope to dispatch and subscribe', () => {
    const { use, run } = createSPAX()
    use(() => {
      return [{
        store: {
          state: {
            x: 2
          },
          actions: {
            setX ({ commit }, x) {
              commit('SETX', x)
            }
          },
          mutations: {
            SETX (state, x) {
              state.x = x
            }
          }
        }
      }, ({ dispatch, subscribe }) => {
        let index = 0
        subscribe('x', x => {
          expect(x).to.equal(2 + (index++))
        })
        dispatch('setX', 3)
      }]
    })
    run()
  })
})
