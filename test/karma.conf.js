import webpack from 'webpack'
import { argv } from 'yargs'

console.log('Creating configuration...')

export default cfg => cfg.set({
  basePath: '../',
  files: [
    './node_modules/regenerator-runtime/runtime.js',
    {
      pattern: './test/index.js',
      watched: false,
      served: true,
      included: true
    }
  ],
  proxies: {
    // '/api/': 'http://0.0.0.0:3000/api/'
  },
  autoWatch: argv.dev,
  singleRun: !argv.dev,
  logLevel: argv.dev ? cfg.LOG_INFO : cfg.LOG_ERROR,
  concurrency: Infinity,
  frameworks: ['mocha', 'es6-shim'],
  preprocessors: {
    'test/index.js': ['webpack', 'sourcemap']
  },
  reporters: ['mocha', 'coverage'],
  coverageReporter: {
    reporters: argv.dev ? [
      { type: 'lcov' },
      { type: 'text-summary' }
    ] : [
      { type: 'lcov' },
      { type: 'json-summary', file: 'lcov.json' }
    ]
  },
  browsers: ['ChromeHeadless'],
  webpack: {
    devtool: 'cheap-module-source-map',
    resolve: {
      modules: ['.', 'node_modules'],
      extensions: ['.js', '.json', '.vue'],
      alias: {
        vue: 'vue/dist/vue'
      }
    },
    plugins: [
      new webpack.DefinePlugin({}),
      new webpack.LoaderOptionsPlugin({
        debug: true,
        options: {
          context: __dirname
        }
      })
    ],
    module: {
      rules: [
        {
          test: /\.(js|vue)$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
            formatter: require('eslint-friendly-formatter')
          },
          enforce: 'pre'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: 'babel-loader'
            }
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    node: {
      fs: 'empty',
      net: 'empty'
    },
    performance: {
      hints: false
    }
  },
  webpackMiddleware: {
    noInfo: true
  }
})
