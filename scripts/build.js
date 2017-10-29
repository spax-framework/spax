var fs = require('fs')
var rollup = require('rollup')
var buble = require('rollup-plugin-buble')
var typescript = require('rollup-plugin-typescript2')
var version = require('../package.json').version

var banner =
  '/*!\n' +
  ' * SPAX v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' crossjs\n' +
  ' * Released under the MIT License.\n' +
  ' */'

rollup.rollup({
  input: 'src/index.ts',
  plugins: [
    typescript(),
    buble()
  ]
})
.then(function (bundle) {
  // es
  bundle.generate({
    format: 'es',
    banner
  }).then(function (bundle) {
    return write('index.js', bundle.code)
  })

  // cjs
  bundle.generate({
    format: 'cjs',
    banner
  }).then(function (bundle) {
    return write('lib/index.js', bundle.code)
  })
})
.catch(logError)

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
