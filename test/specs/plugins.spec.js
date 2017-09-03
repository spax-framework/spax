import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import Router from 'vue-router'
import map from 'spax/context/plugins/map'
import redirect from 'spax/context/plugins/redirect'
import * as log from 'spax/shared/log'

Vue.use(Vuex)
Vue.use(Router)
Vue.use(map)
Vue.use(redirect)

// hack
Vue.mixin({
  beforeCreate () {
    const { parent, store } = this.$options
    // store injection
    if (store) {
      this.$store = new Store(store)
    } else if (parent && parent.$store) {
      this.$store = parent.$store
    }
  }
})

// prepare
// process.env.NODE_ENV = 'production'
Vue.component('c-comp', {
  template: '<c-comp-child></c-comp-child>'
})
Vue.component('c-comp-child', {
  template: '<i>c-comp-child</i>'
})

describe('map', () => {
  describe('options', () => {
    const vm = new Vue({
      scope: 'scope1',
      prefixes: ['prefix1'],
      data: {},
      template: '<c-comp></c-comp>'
    }).$mount()

    it('should have `scope`', () => {
      expect(vm.$children[0].$scope).to.equal('scope1')
      expect(vm.$children[0].$children[0].$scope).to.equal('scope1')
    })

    it('should have `prefixes`', () => {
      expect(vm.$children[0].$prefixes).to.eql(['prefix1'])
      expect(vm.$children[0].$children[0].$prefixes).to.eql(['prefix1'])
    })
  })

  describe('mapState', () => {
    const vm = new Vue({
      scope: 'test',
      // mocking $store
      store: {
        modules: {
          test: {
            namespaced: true,
            state: {
              a: 1
            }
          },
          mod1: {
            namespaced: true,
            state: {
              a: 1
            }
          }
        }
      },
      template: '<c-comp></c-comp>',
      mapState: ['a', 'mod1/a as a1']
    }).$mount()

    it('should have `a`', () => {
      expect(vm.a).to.equal(1)
    })

    it('should have `a1`', () => {
      expect(vm.a1).to.equal(1)
    })

    describe('exception', () => {
      it('should warn mapState type', () => {
        function fn () {
          new Vue({
            template: '<c-comp></c-comp>',
            mapState: 'a'
          }).$mount()
        }

        sinon.spy(log, 'warn')
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'production'
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'development'
        log.warn.restore()
      })
    })
  })

  describe('mapGetters', () => {
    const vm = new Vue({
      scope: 'test',
      // mocking $store
      store: {
        modules: {
          test: {
            namespaced: true,
            state: {
              _a: 1
            },
            getters: {
              a (state) {
                return state._a
              }
            }
          },
          mod1: {
            namespaced: true,
            state: {
              _a: 1
            },
            getters: {
              a (state) {
                return state._a
              }
            }
          }
        }
      },
      template: '<c-comp></c-comp>',
      mapGetters: ['a', 'mod1/a as a1']
    }).$mount()

    it('should have `a`', () => {
      expect(vm.a).to.equal(1)
    })

    it('should have `a1`', () => {
      expect(vm.a1).to.equal(1)
    })

    describe('exception', () => {
      it('should warn mapGetters type', () => {
        function fn () {
          new Vue({
            template: '<c-comp></c-comp>',
            mapGetters: 'a'
          }).$mount()
        }

        sinon.spy(log, 'warn')
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'production'
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'development'
        log.warn.restore()
      })

      it('should warn unknown getter', () => {
        const vm = new Vue({
          template: '<c-comp></c-comp>',
          scope: 'test',
          // mocking $store
          store: {
            modules: {
              test: {
                namespaced: true,
                state: {
                  _a: 1
                },
                getters: {
                  b (state) {
                    return state._a
                  }
                }
              }
            }
          },
          mapGetters: ['a']
        }).$mount()

        sinon.spy(log, 'warn')
        vm.a
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'production'
        vm.a
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'development'
        log.warn.restore()
      })
    })
  })

  describe('mapActions', () => {
    const vm = new Vue({
      scope: 'test',
      // mocking $store
      store: {
        modules: {
          test: {
            namespaced: true,
            actions: {
              a () {}
            }
          },
          mod1: {
            namespaced: true,
            actions: {
              a () {}
            }
          }
        }
      },
      template: '<c-comp></c-comp>',
      mapActions: ['a', 'mod1/a as a1']
    }).$mount()

    it('should have `a`', () => {
      expect(vm.a).to.be.a('function')
      vm.$store.dispatch = (...args) => {
        expect(args).to.eql(['test/a', 1, 2, 3])
      }
      vm.a(1, 2, 3)
    })

    it('should have `a1`', () => {
      expect(vm.a1).to.be.a('function')
      vm.$store.dispatch = (...args) => {
        expect(args).to.eql(['mod1/a', 1, 2, 3])
      }
      vm.a1(1, 2, 3)
    })

    describe('exception', () => {
      it('should warn mapActions type', () => {
        function fn () {
          new Vue({
            template: '<c-comp></c-comp>',
            mapActions: 'a'
          }).$mount()
        }
        sinon.spy(log, 'warn')
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'production'
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'development'
        log.warn.restore()
      })
    })
  })

  describe('mapMutations', () => {
    const vm = new Vue({
      scope: 'test',
      // mocking $store
      store: {
        modules: {
          test: {
            namespaced: true,
            actions: {
              a () { }
            }
          },
          mod1: {
            namespaced: true,
            actions: {
              a () { }
            }
          }
        }
      },
      template: '<c-comp></c-comp>',
      mapMutations: ['a', 'mod1/a as a1']
    }).$mount()

    it('should have `a`', () => {
      expect(vm.a).to.be.a('function')
      vm.$store.commit = (...args) => {
        expect(args).to.eql(['test/a', 1, 2, 3])
      }
      vm.a(1, 2, 3)
    })

    it('should have `a1`', () => {
      expect(vm.a1).to.be.a('function')
      vm.$store.commit = (...args) => {
        expect(args).to.eql(['mod1/a', 1, 2, 3])
      }
      vm.a1(1, 2, 3)
    })

    describe('exception', () => {
      it('should warn mapMutations type', () => {
        function fn () {
          new Vue({
            template: '<c-comp></c-comp>',
            mapMutations: 'a'
          }).$mount()
        }
        sinon.spy(log, 'warn')
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'production'
        fn()
        assert(log.warn.callCount === 1)
        process.env.NODE_ENV = 'development'
        log.warn.restore()
      })
    })
  })
})

describe('redirect', () => {
  const Comp = {
    template: '<div>Comp</div>'
  }
  const vm = new Vue({
    router: new Router({
      routes: [
        {
          path: '/',
          component: Comp
        },
        {
          path: '/a',
          component: Comp
        },
        {
          path: '/b',
          component: Comp
        }
      ]
    }),
    scope: 'scope1',
    prefixes: ['prefix1'],
    data: {},
    template: '<c-comp></c-comp>'
  }).$mount()

  it('should have $router', () => {
    assert(vm.$router instanceof Router)
  })

  it('should have $redirect', () => {
    assert(typeof vm.$redirect === 'function')
  })

  it('should handle path object', () => {
    vm.$redirect({
      path: '/a'
    })
    expect(vm.$router.currentRoute.path).to.equal('/prefix1/a')
  })

  it('should handle path object with prefix', () => {
    vm.$redirect({
      path: '/a',
      prefix: 'prefix1'
    })
    expect(vm.$router.currentRoute.path).to.equal('/prefix1/a')
  })

  it('should have prefix', () => {
    vm.$redirect('/')
    expect(vm.$router.currentRoute.path).to.equal('/prefix1')
  })

  it('should push', done => {
    vm.$redirect('/a')
    expect(vm.$router.currentRoute.path).to.equal('/prefix1/a')
    vm.$nextTick(() => {
      vm.$redirect('/b')
      expect(vm.$router.currentRoute.path).to.equal('/prefix1/b')
      vm.$router.go(-1)
      setTimeout(() => {
        expect(vm.$router.currentRoute.path).to.equal('/prefix1/a')
        done()
      }, 200)
    })
  })

  it('should replace', done => {
    vm.$redirect('/')
    vm.$redirect('/a')
    vm.$redirect('/b', true)
    vm.$router.back()
    setTimeout(() => {
      expect(vm.$router.currentRoute.path).to.equal('/prefix1')
      done()
    }, 200)
  })
})

