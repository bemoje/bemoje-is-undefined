const packageName = require('./package.json').name.replace('@bemoje/', '')

export default {
	input: 'src/' + packageName + '.js',
	output: [
		{
			file: 'dist/' + packageName + '.es.js',
			format: 'esm',
		},
		{
			file: 'dist/' + packageName + '.umd.js',
			format: 'umd',
			name: packageName,
		},
		{
			file: 'dist/' + packageName + '.cjs.js',
			format: 'cjs',
			name: packageName,
		},
	],
}
