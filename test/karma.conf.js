const webpack = require('webpack')
const { argv } = require('yargs')

module.exports = config => config.set({
  basePath: '../',
  files: [
    './node_modules/regenerator-runtime/runtime.js',
    {
      pattern: './test/specs/*.spec.js',
      watched: false,
      served: true,
      included: true
    }
  ],
  autoWatch: argv.dev,
  singleRun: !argv.dev,
  logLevel: argv.dev ? config.LOG_INFO : config.LOG_ERROR,
  concurrency: Infinity,
  frameworks: ['mocha', 'chai', 'sinon', 'es6-shim'],
  preprocessors: {
    './test/specs/*.spec.js': ['webpack', 'sourcemap']
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
      extensions: ['.ts', '.js', '.json', '.vue'],
      alias: {
        vue: 'vue/dist/vue'
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        // 'process.env.NODE_ENV': JSON.stringify('production')
      }),
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
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: 'babel-loader!ts-loader'
            }
          }
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader'
          }, {
            loader: 'ts-loader'
          }]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    performance: {
      hints: false
    }
  },
  webpackMiddleware: {
    noInfo: true
  }
})
