import SPAX from 'spax'

describe('configure', () => {
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

  it('should configure', done => {
    const { configure, use, run } = new SPAX()
    configure({
      prefix: 'myapp'
    })
    use(({ prefix }) => {
      expect(prefix).to.equal('myapp2')
    })
    configure({
      prefix: 'myapp2'
    })
    use(({ prefix }) => {
      expect(prefix).to.equal('myapp2')
    })
    run(() => {
      done()
    })
  })
})
