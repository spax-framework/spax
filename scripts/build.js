var rollup = require('rollup')
var typescript = require('rollup-plugin-typescript2')
var buble = require('rollup-plugin-buble')
var replace = require('rollup-plugin-replace')
var version = require('../package.json').version

var banner =
  '/*!\n' +
  ' * SPAX v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' crossjs\n' +
  ' * Released under the MIT License.\n' +
  ' */'

async function build (out, replacement) {
  const bundle = await rollup.rollup({
    input: 'src/index.ts',
    plugins: [
      typescript(),
      buble(),
      replace(replacement)
    ]
  })

  await bundle.write(out)
}

(async function () {
  await build({
    file: 'spax.es.js',
    format: 'es',
    banner: banner
  }, {
    'process.env.VERSION': JSON.stringify(version)
  })

  await build({
    file: 'spax.common.js',
    format: 'cjs',
    banner: banner
  }, {
    'process.env.VERSION': JSON.stringify(version),
    'process.env.NODE_ENV': JSON.stringify('production')
  })
})()
