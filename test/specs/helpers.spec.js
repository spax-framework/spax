import analysisMap from 'spax/helpers/analysis-map'
import addPrefixToPath from 'spax/helpers/add-prefix'
import injectOptionsToComponent from 'spax/helpers/inject-options'

describe('analysisMap', () => {
  it('`s/v as a`', () => {
    const { scope, value, alias } = analysisMap('scope1/value1 as value2')
    expect(scope).to.equal('scope1')
    expect(value).to.equal('value1')
    expect(alias).to.equal('value2')
  })

  it('`s/v`', () => {
    const { scope, value, alias } = analysisMap('scope1/value1')
    expect(scope).to.equal('scope1')
    expect(value).to.equal('value1')
    expect(alias).to.equal('value1')
  })

  it('`v, s`', () => {
    const { scope, value, alias } = analysisMap('value1', 'scope1')
    expect(scope).to.equal('scope1')
    expect(value).to.equal('value1')
    expect(alias).to.equal('value1')
  })

  it('`v as a, s`', () => {
    const { scope, value, alias } = analysisMap('value1 as value2', 'scope1')
    expect(scope).to.equal('scope1')
    expect(value).to.equal('value1')
    expect(alias).to.equal('value2')
  })
})

describe('addPrefixToPath', () => {
  describe('path 不以 `/` 开头', () => {
    it('prefix 数组长度为 1', () => {
      expect(addPrefixToPath(['a'], 'b')).to.equal('/a/b')
    })

    it('prefix 数组长度大于 1', () => {
      expect(addPrefixToPath(['a', 'c'], 'b')).to.equal('/a/c/b')
    })
  })

  describe('path 以 `/` 开头', () => {
    it('prefix 数组长度为 1', () => {
      expect(addPrefixToPath(['a'], '/b')).to.equal('/a/b')
    })

    it('prefix 数组长度大于 1', () => {
      expect(addPrefixToPath(['a', 'c'], '/b')).to.equal('/a/b')
    })
  })
})

describe('injectOptionsToComponent', () => {
  it('生产环境', () => {
    process.env.NODE_ENV = 'production'
    expect(injectOptionsToComponent({}, { x: 1 }).x).to.equal(1)
  })

  it('开发环境', () => {
    process.env.NODE_ENV = 'development'
    expect(injectOptionsToComponent({}, { x: 1 }).x).to.be.undefined
    expect(injectOptionsToComponent({
      _Ctor: [
        {
          options: {}
        }
      ]
    }, { x: 1 })._Ctor[0].options.x).to.equal(1)
  })

  it('component 为空', () => {
    process.env.NODE_ENV = 'production'
    expect(injectOptionsToComponent(null, { x: 1 })).to.be.null
  })
})
