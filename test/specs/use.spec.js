import createSPAX from 'src'

describe('use', () => {
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

  it('should ONLY accept function creator', () => {
    const { middlewares, use } = createSPAX()
    const a = function () {}
    const b = {}
    use(a)
    expect(() => use(b)).to.throw(Error)
    expect(middlewares.find(middleware => middleware.creator === a)).to.be.an('object').that.have.own.property('creator', a)
    expect(middlewares.find(middleware => middleware.creator === b)).to.be.undefined
  })

  it('should ONLY execute creator after run', () => {
    const { use, run } = createSPAX()
    let a = 1
    use(({ prefix }) => {
      // 在 run 之后才执行到此处
      a = 2
    })
    expect(a).to.equal(1)
    run()
    expect(a).to.equal(2)
  })
})
