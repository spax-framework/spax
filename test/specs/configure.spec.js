import createSPAX from 'src'

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
    expect(createSPAX().context.prefix).to.equal('/')
    expect(createSPAX({
      prefix: 'myapp'
    }).context.prefix).to.equal('myapp')
  })
})
