# SPAX

> Framework for Single Page Application

[![Travis](https://img.shields.io/travis/spax-framework/spax.svg?style=flat-square)](https://travis-ci.org/spax-framework/spax)
[![Coveralls](https://img.shields.io/coveralls/spax-framework/spax.svg?style=flat-square)](https://coveralls.io/github/spax-framework/spax)
[![dependencies](https://david-dm.org/spax-framework/spax.svg?style=flat-square)](https://david-dm.org/spax-framework/spax)
[![devDependency Status](https://david-dm.org/spax-framework/spax/dev-status.svg?style=flat-square)](https://david-dm.org/spax-framework/spax?type=dev)
[![NPM version](https://img.shields.io/npm/v/spax.svg?style=flat-square)](https://npmjs.org/package/spax)

## Install

```bash
$ npm install spax
```
## Usage

```js
import { configure, use, run } from 'spax'
```

## Webpack

```js
...
module: {
  rules: [
    ...
    {
      test: /\.ts$/,
      // spax needs babel and ts
      exclude: /node_modules[/\\](?!spax[/\\])/,
      loader: 'babel-loader!ts-loader'
    },
    ...
  ]
}
...
```

## Examples

- [TodoMVC](examples/todomvc)

## License

[MIT](http://opensource.org/licenses/MIT)
