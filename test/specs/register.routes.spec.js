import SPAX from 'spax'

describe('register.routes', () => {
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

  it('should handle simple routes', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp',
      component: {
        template: '<router-view></router-view>'
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/',
            component: {
              template: '<a id="myapp-mymod">a</a>'
            }
          }
        ],
        options: {
          prefix: 'mymod'
        }
      }
    })
    run(({ prefix }) => {
      expect(prefix).to.equal('myapp')
      location.hash = '/myapp/mymod'
      setTimeout(() => {
        assert(document.getElementById('myapp-mymod'))
        location.hash = '/'
        done()
      }, 50)
    })
  })

  it('should handle redirect', done => {
    const { configure, use, run } = new SPAX()

    configure({
      component: {
        template: '<router-view></router-view>'
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/r1',
            redirect: '/r2'
          },
          {
            path: '/r2',
            component: {
              template: '<a id="r1-r2">a</a>'
            }
          }
        ]
      }
    })
    run(() => {
      location.hash = '/r1'
      setTimeout(() => {
        assert(document.getElementById('r1-r2'))
        location.hash = '/'
        done()
      }, 50)
    })
  })

  it('should handle alias', done => {
    const { configure, use, run } = new SPAX()

    configure({
      component: {
        template: '<router-view></router-view>'
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/r3',
            alias: '/r4',
            component: {
              template: '<a id="r3-r4">a</a>'
            }
          }
        ]
      }
    })
    run(() => {
      location.hash = '/r4'
      setTimeout(() => {
        assert(document.getElementById('r3-r4'))
        location.hash = '/'
        done()
      }, 50)
    })
  })

  it('should handle components', done => {
    const { configure, use, run } = new SPAX()

    configure({
      component: {
        template: `<div>
          <router-view></router-view>
          <router-view name="a"></router-view>
          <router-view name="b"></router-view>
        </div>`
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/',
            components: {
              default: { template: '<a id="cs-default">default</a>' },
              a: { template: '<a id="cs-a">a</a>' },
              b: { template: '<a id="cs-b">b</a>' }
            }
          }
        ]
      }
    })
    run(() => {
      location.hash = '/'
      setTimeout(() => {
        assert(document.getElementById('cs-default'))
        assert(document.getElementById('cs-a'))
        assert(document.getElementById('cs-b'))
        location.hash = '/'
        done()
      }, 50)
    })
  })

  it('should handle children routes', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp',
      component: {
        template: '<router-view></router-view>'
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/',
            component: {
              template: '<a id="myapp-mymod">a<router-view></router-view></a>'
            },
            children: [{
              path: 'child',
              component: {
                template: '<b id="myapp-mymod-child">b</b>'
              }
            }]
          }
        ],
        options: {
          prefix: 'mymod'
        }
      }
    })
    run(() => {
      location.hash = '/myapp/mymod'
      setTimeout(() => {
        assert(document.getElementById('myapp-mymod'))
        location.hash = '/myapp/mymod/child'
        setTimeout(() => {
          assert(document.getElementById('myapp-mymod-child'))
          location.hash = '/'
          done()
        }, 50)
      }, 50)
    })
  })

  it('should handle async routes', done => {
    const { configure, use, run } = new SPAX()

    configure({
      prefix: 'myapp',
      component: {
        template: '<router-view></router-view>'
      }
    })
    use(() => {
      return {
        routes: [
          {
            path: '/',
            component: {
              template: '<a id="myapp-mymod">a</a>'
            }
          },
          {
            path: '/create',
            component: () => import('./fixtures/create')
          }
        ],
        options: {
          prefix: 'mymod'
        }
      }
    })
    run(() => {
      location.hash = '/myapp/mymod/create'
      setTimeout(() => {
        assert(document.getElementById('fixture-create'))
        location.hash = '/'
        done()
      }, 50)
    })
  })
})
