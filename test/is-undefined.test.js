import isUndefined from '../src/is-undefined'

describe('isUndefined', () => {
	test('works', () => {
		expect(isUndefined(void 0)).toBe(true)
		expect(isUndefined(undefined)).toBe(true)
		expect(isUndefined(null)).toBe(false)
		expect(isUndefined('undefined')).toBe(false)
	})
})
