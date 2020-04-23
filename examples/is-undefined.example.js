import isUndefined from '../src/is-undefined'

isUndefined(void 0)
//=> true

isUndefined(undefined)
//=> true

isUndefined('undefined')
//=> false

isUndefined(null)
//=> false
