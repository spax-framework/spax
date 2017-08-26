import path from 'path'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const pkg = require('./package.json')

const postcssOptions = {
  plugins: [
    require('postcss-import')({
      path: path.resolve(__dirname, './application/styles')
    }),
    require('postcss-url')({
      basePath: path.resolve(__dirname, './static')
    }),
    require('postcss-cssnext')({
      features: {
        customProperties: {
          variables: require(path.resolve(__dirname, './application/styles/variables'))
        }
      }
    }),
    require('postcss-browser-reporter')(),
    require('postcss-reporter')()
  ]
}

const webpackConfig = {
  target: 'web',
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.css', '.js', '.json', '.vue'],
    alias: {
      spax: path.resolve(__dirname, '../../index.js')
    }
  },
  node: {
    fs: 'empty',
    net: 'empty'
  },
  devtool: 'cheap-module-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    compress: true,
    disableHostCheck: true,
    hot: true,
    noInfo: true
  },
  entry: {
    app: [
      './node_modules/regenerator-runtime/runtime.js',
      './index.js']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].js'
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          postcss: postcssOptions,
          autoprefixer: false,
          loaders: {
            js: 'babel-loader'
          },
          // 必须为 true，否则 vue-loader@12.0.0 会导致 css 加载顺序混乱
          extractCSS: true
        }
      },
      {
        test: /\.css$/,
        loader: 'postcss-loader',
        options: postcssOptions
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './index.ejs'),
      title: `${pkg.name} - ${pkg.description}`,
      hash: false,
      inject: true,
      minify: {
        collapseWhitespace: false,
        minifyJS: false
      }
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, './static')
    }]),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: __dirname
      }
    })
  ]
}

export default webpackConfig
