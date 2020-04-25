# @bemoje/is-undefined

Check whether the provided value is undefined.

#### Version

<span><a href="https://npmjs.org/@bemoje/is-undefined" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@bemoje/is-undefined" alt="NPM version" /></a></span>

#### Travis CI

<span><a href="https://npmjs.org/@bemoje/is-undefined" title="View this project on NPM"><img src="https://travis-ci.org/bemoje/bemoje-is-undefined.svg?branch=master" alt="dependencies" /></a></span>

#### Dependencies

<span><a href="https://npmjs.org/@bemoje/is-undefined" title="View this project on NPM"><img src="https://david-dm.org/bemoje/bemoje-is-undefined.svg" alt="dependencies" /></a></span>

#### Stats

<span><a href="https://npmjs.org/@bemoje/is-undefined" title="View this project on NPM"><img src="https://img.shields.io/npm/dt/@bemoje/is-undefined" alt="NPM downloads" /></a></span>
<span><a href="https://github.com/bemoje/bemoje-is-undefined/fork" title="Fork this project"><img src="https://img.shields.io/github/forks/bemoje/bemoje-is-undefined" alt="Forks" /></a></span>

#### Donate

<span><a href="https://www.buymeacoffee.com/bemoje" title="Donate to this project using Buy Me A Beer"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?label=Buy me a beer!" alt="Buy Me A Beer donate button" /></a></span>
<span><a href="https://paypal.me/forstaaloen" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg?label=PayPal" alt="PayPal donate button" /></a></span>

## Installation

```sh
npm install @bemoje/is-undefined
npm install --save @bemoje/is-undefined
npm install --save-dev @bemoje/is-undefined
```

## Usage

```javascript
import isUndefined from '@bemoje/is-undefined'

isUndefined(void 0)
//=> true

isUndefined(undefined)
//=> true

isUndefined('undefined')
//=> false

isUndefined(null)
//=> false

```

## Benchmark
70501 nanoseconds
## Tests
Uses *Jest* to test module functionality. Run tests to get coverage details.

```bash
npm run test
```

## API
### isUndefined

Check whether the provided value is undefined.

##### Parameters

-   `value` **any** The value to evaluate.

##### Returns
**[boolean][3]** 

[1]: #isundefined

[2]: #parameters

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean