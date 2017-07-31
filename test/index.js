import chai from 'chai'

localStorage.clear()

// Reset styles
document.body.style.margin = '0px'
document.body.style.padding = '0px'

global.Promise = Promise
global.assert = chai.assert
global.expect = chai.expect

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./', true, /\.spec\.js$/)
testsContext.keys().forEach(testsContext)

// require all spax files except index.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const componentsContext = require.context('../', true, /^\.[/\\]((?!test|coverage|node_modules).)*(\.js)$/)
componentsContext.keys().forEach(componentsContext)
