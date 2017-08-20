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

  it('should configure', () => {
    const { context, configure } = new SPAX()
    expect(context.prefix).to.equal('/')
    configure({
      prefix: 'myapp'
    })
    expect(context.prefix).to.equal('myapp')
  })
})
