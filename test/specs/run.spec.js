import createSPAX from 'src'

describe('run', () => {
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

  const { run } = createSPAX({
    prefix: 'myapp'
  })

  it('should run', () => {
    run(({ prefix }) => {
      expect(prefix).to.equal('myapp')
    })
  })

  it('should run only once', () => {
    expect(run).to.throw(Error)
  })
})
