(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global['is-undefined'] = factory());
}(this, (function () { 'use strict';

	/**
	 * Check whether the provided value is undefined.
	 * @method isUndefined
	 * @param {*} value - The value to evaluate.
	 * @returns {boolean}
	 */
	function isUndefined(value) {
		return value === void 0
	}

	return isUndefined;

})));
