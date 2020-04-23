import { exec as exe } from 'child_process'
import fs from 'fs'
import path from 'path'
import walkSync from 'walk-sync'

const log = console.log

function splitLines(str) {
	return str.match(/[^\r\n]+/gm)
}

function capFirstLetter(str) {
	return str.substring(0, 1).toUpperCase() + str.slice(1)
}

const repo = new (class {
	constructor() {}
	get packagePath() {
		return path.join(process.cwd(), 'package.json')
	}
	get packageLockPath() {
		return path.join(process.cwd(), 'package-lock.json')
	}
	get package() {
		return JSON.parse(this.readFile(this.packagePath))
	}
	get srcDirPath() {
		return path.join(process.cwd(), 'src')
	}
	get testDirPath() {
		return path.join(process.cwd(), 'test')
	}
	get scriptsDirPath() {
		return path.join(process.cwd(), 'scripts')
	}
	get examplesDirPath() {
		return path.join(process.cwd(), 'examples')
	}
	get docsDirPath() {
		return path.join(process.cwd(), 'docs')
	}
	get distDirPath() {
		return path.join(process.cwd(), 'dist')
	}
	get coverageDirPath() {
		return path.join(process.cwd(), 'coverage')
	}
	get node_modulesDirPath() {
		return path.join(process.cwd(), 'node_modules')
	}
	get node_modulesNames() {
		return this.filesIn(this.node_modulesDirPath)
	}
	get srcEntryFilePath() {
		return path.join(process.cwd(), 'src')
	}
	get configBabelPath() {
		return path.join(process.cwd(), 'babel.config.json')
	}
	get configTravisPath() {
		return path.join(process.cwd(), 'travis.yml')
	}
	get configGitIgnorePath() {
		return path.join(process.cwd(), '.gitignore')
	}
	get configNpmIgnorePath() {
		return path.join(process.cwd(), '.npmignore')
	}
	get indexJsPath() {
		return path.join(process.cwd(), 'index.js')
	}
	get configJestPath() {
		return path.join(process.cwd(), 'jest.config.js')
	}
	get configRollupPath() {
		return path.join(process.cwd(), 'rollup.config.js')
	}
	get readmePath() {
		return path.join(process.cwd(), 'readme.md')
	}
	get githubPassword() {
		return require(path.join(process.cwd(), 'credentials', 'github.json'))
			.github
	}
	readFile(filePath) {
		return fs.readFileSync(filePath).toString()
	}
	filesIn(dirPath) {
		return fs.readdirSync(dirPath)
	}
	packageWrite(callback) {
		return fs.writeFileSync(
			this.packagePath,
			JSON.stringify(callback(this.package), null, 3),
		)
	}
	bumpVersionMajor() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[0]++
			arrVersion[1] = 0
			arrVersion[2] = 0
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}
	bumpVersionMinor() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[1]++
			arrVersion[2] = 0
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}
	bumpVersionPatch() {
		this.packageWrite((pkg) => {
			const arrVersion = pkg.version.split('.').map(Number)
			arrVersion[2]++
			pkg.version = arrVersion.join('.')
			return pkg
		})
	}
	async exec(cmd) {
		return new Promise((resolve, reject) => {
			try {
				exe(cmd, (err, stdout, stderr) => {
					if (err) reject(err)
					const data = {
						cmd: cmd,
						stdout: splitLines(stdout),
						stderr: splitLines(stderr),
						print: () => {
							console.log(data.cmd)
							if (data.stdout) {
								for (let out of data.stdout) {
									console.log(out)
								}
							}
							if (data.stderr) {
								for (let err of data.stderr) {
									console.error(err)
								}
							}
						},
					}
					resolve(data)
				})
			} catch (err) {
				reject(err)
			}
		})
	}
	async npmInstall(name) {
		const o = await this.exec('npm i ' + name)
		o.print()
	}
	async npmInstallSave(name) {
		const o = await this.exec('npm i ' + name + ' --save')
		o.print()
	}
	async npmInstallDev(name) {
		const o = await this.exec('npm i ' + name + ' --save-dev')
		o.print()
	}
	async npmPublish() {
		const o = await this.exec('npm publish --access public')
		o.print()
	}
	async runTests() {
		const o = await this.exec('jest')
		o.print()
	}
	async runExamples() {
		this.filesIn(this.examplesDirPath).forEach(async (fileName) => {
			const o = await this.exec('node -r esm examples/' + fileName)
			o.print()
		})
	}

	isDefaultExportClass() {
		const src = this.getSrcEntry()
		if (src.includes('export default class')) {
			return true
		}
		if (src.includes('export default function')) {
			return false
		}
		return new Error(
			'could not determine from source entry file if its a class export or not',
		)
	}
	isDefaultExportFunction() {
		const src = this.getSrcEntry()
		if (src.includes('export default function')) {
			return true
		}
		if (src.includes('export default class')) {
			return false
		}
		return new Error(
			'could not determine from source entry file if its a class export or not',
		)
	}
	walkFiles(callback) {
		walkSync(process.cwd(), {
			directories: false,
			includeBasePath: true,
			ignore: ['node_modules', 'coverage', 'docs', '.git'],
		}).forEach((path) => {
			callback(path)
		})
	}
	replaceInAllFileNames(strFind, strReplace) {
		this.walkFiles((filePath) => {
			const arr = filePath.split('/')
			let fileName = arr.pop()
			if (fileName.includes(strFind)) {
				fileName = fileName.replace(strFind, strReplace)
				fs.renameSync(filePath, path.join(...arr, fileName))
			}
		})
	}
	replaceInAllFileContent(strFind, strReplace) {
		this.walkFiles((filePath) => {
			const src = fs.readFileSync(filePath).toString()
			const strNew = src.replace(new RegExp(strFind, 'g'), strReplace)
			fs.writeFileSync(filePath, strNew)
		})
	}
	getSrcEntryPath() {
		const arr = this.package.name.split('/')
		let filename
		if (arr.length === 1) {
			filename = arr[0]
		} else if (arr.length === 2) {
			filename = arr[1]
		}
		return path.join(process.cwd(), 'src', filename + '.js')
	}
	getSrcEntry() {
		return fs.readFileSync(this.getSrcEntryPath()).toString()
	}
	parseName(fullName = this.package.name) {
		let isClass = this.isDefaultExportClass()
		let name = fullName
		let isScoped = false
		let scope = ''
		let atScope = ''

		if (fullName.includes('@')) {
			isScoped = true
			const split = fullName.split('/')
			name = split[1]
			scope = split[0].replace('@', '')
			atScope = split[0]
		}

		let method = name
			.split('-')
			.map((str, i) => {
				if (i === 0) {
					if (isClass) {
						return capFirstLetter(str)
					} else {
						return str
					}
				} else {
					return capFirstLetter(str)
				}
			})
			.join('')
		let repoName = this.package.github.user + '-' + name

		return {
			method,
			fullName,
			name,
			isScoped,
			isClass,
			scope,
			atScope,
			repoName,
		}
	}
	async rename(name) {
		const oCurrent = this.parseName(this.package.name)
		const oNew = this.parseName(name)
		if (oCurrent.isScoped && !oNew.isScoped) {
			oNew.isScoped = oCurrent.isScoped
			oNew.atScope = oCurrent.atScope
			oNew.scope = oCurrent.scope
		}

		console.log({ oCurrent, oNew })

		this.replaceInAllFileNames(oCurrent.atScope, oNew.atScope)
		this.replaceInAllFileContent(oCurrent.atScope, oNew.atScope)

		this.replaceInAllFileNames(oCurrent.name, oNew.name)
		this.replaceInAllFileContent(oCurrent.name, oNew.name)

		this.replaceInAllFileNames(oCurrent.method, oNew.method)
		this.replaceInAllFileContent(oCurrent.method, oNew.method)

		const res = await this.exec('npm run build')
		res.print()
	}
	api() {
		const proto = this.constructor.prototype
		let protoKeys = Object.getOwnPropertyNames(proto)
		protoKeys = protoKeys.map((key, i) => {
			const descriptor = Object.getOwnPropertyDescriptor(proto, key)
			if (typeof descriptor.value !== 'undefined') {
				return key + '()'
			} else {
				return key
			}
		})
		console.log(protoKeys.sort().join('\n'))
	}
	wipeDir(relativeDirPath) {
		walkSync(path.join(process.cwd(), ...relativeDirPath.split('/')), {
			directories: true,
			includeBasePath: false,
		}).forEach((filePath) => {
			fs.unlinkSync(filepath)
		})
	}
	removeDir(relativeDirPath) {
		fs.unlinkSync(path.join(process.cwd(), ...relativeDirPath.split('/')))
	}
	removeFile(relativeFilePath) {
		fs.unlinkSync(path.join(process.cwd(), ...relativeFilePath.split('/')))
	}
	writeReadme() {
		const {
			method,
			fullName,
			name,
			isScoped,
			isClass,
			scope,
			atScope,
			repoName,
		} = this.parseName()

		const githubUser = this.package.github.user
		const npmUser = githubUser

		const str = [
			'# ' + fullName,
			'',
			this.package.description,
			'',
			'#### Version',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://img.shields.io/npm/v/' +
				(isScoped ? atScope + '/' : '') +
				'' +
				name +
				'" alt="NPM version" /></a></span>',
			'',
			'#### Travis CI',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://travis-ci.org/' +
				githubUser +
				'/' +
				repoName +
				'.svg?branch=master" alt="dependencies" /></a></span>',
			'',
			'#### Dependencies',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://david-dm.org/' +
				githubUser +
				'/' +
				repoName +
				'.svg" alt="dependencies" /></a></span>',
			'',
			'#### Stats',
			'',
			'<span><a href="https://npmjs.org/' +
				atScope +
				'/' +
				name +
				'" title="View this project on NPM"><img src="https://img.shields.io/npm/dt/' +
				atScope +
				'/' +
				name +
				'" alt="NPM downloads" /></a></span>',
			'<span><a href="https://github.com/' +
				githubUser +
				'/' +
				repoName +
				'/fork" title="Fork this project"><img src="https://img.shields.io/github/forks/' +
				githubUser +
				'/' +
				repoName +
				'" alt="Forks" /></a></span>',
			'',
			'#### Donate',
			'',
			'<span><a href="https://www.buymeacoffee.com/bemoje" title="Donate to this project using Buy Me A Beer"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?label=Buy me a beer!" alt="Buy Me A Beer donate button" /></a></span>',
			'<span><a href="https://paypal.me/forstaaloen" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg?label=PayPal" alt="PayPal donate button" /></a></span>',
			'',
			'## Installation',
			'',
			'```sh',
			'npm install ' + fullName,
			'npm install --save ' + fullName,
			'npm install --save-dev ' + fullName,
			'```',
			'',
			'## Usage',
			'',
			'```javascript',
			'// import library',
			'import ' + method + " from '" + fullName + "'",
			'',
			this.filesIn(this.examplesDirPath)
				.map((filePath) => {
					const lines = this.readFile(
						path.join(this.examplesDirPath, filePath),
					).split(/\r\n|\r|\n/gm)
					lines.shift()
					if (lines[0].length === 0) {
						lines.shift()
					}
					return lines.join('\n')
				})
				.join('\n\n'),
			'```',
			'',
			(() => {
				const benchResultsPath = path.join(
					process.cwd(),
					'benchmark',
					'results.md',
				)
				if (fs.existsSync(benchResultsPath)) {
					return fs.readFileSync(benchResultsPath)
				}
				return ''
			})(),
			'## Tests',
			'Uses *Jest* to test module functionality. Run tests to get coverage details.',
			'',
			'```bash',
			'npm run test',
			'```',
			'',
			'## API',
			this.getApi(),
			'',
			'## License',
			'',
			'Copyright (c) 2020 | [MIT](https://en.wikipedia.org/wiki/MIT_License) |',
			'[' +
				this.package.author.name +
				'](https://github.com/' +
				githubUser +
				'/) <<' +
				this.package.author.email +
				'>>',
			'',
			'Permission is hereby granted, free of charge, to any person obtaining a copy of',
			'this software and associated documentation files (the "Software"), to deal in',
			'the Software without restriction, including without limitation the rights to',
			'use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of',
			'the Software, and to permit persons to whom the Software is furnished to do so,',
			'subject to the following conditions:',
			'',
			'The above copyright notice and this permission notice shall be included in all',
			'copies or substantial portions of the Software.',
			'',
			'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
			'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS',
			'FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR',
			'COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER',
			'IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN',
			'CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
		].join('\n')
		const filePath = path.join(process.cwd(), 'readme.md')
		fs.writeFileSync(filePath, str, 'utf8')
	}
	getApi() {
		const apiPath = path.join(process.cwd(), 'docs', 'api.md')
		if (fs.existsSync(apiPath)) {
			let lines = splitLines(this.readFile(apiPath))
			lines.shift()
			lines = lines
				.map((line) => {
					if (line.includes('###')) {
						return line.replace('###', '####')
					}
					return line
				})
				.map((line) => {
					if (line.includes('#### Parameters')) {
						return '##### Parameters'
					}
					return line
				})
				.map((line) => {
					if (line.indexOf('Returns ') === 0) {
						return line.replace('Returns ', '##### Returns\n')
					}
					return line
				})
			lines = lines.join('\n\n')
			return (
				'#' + lines.slice(lines.indexOf('## ' + this.parseName().method))
			)
		}
		return ''
	}
	async gitCommit() {
		const data = await this.exec('bash scripts/github-commit.sh')
		data.print()
	}
	async gitCreate() {
		const user = this.package.github.user
		const pw = this.githubPassword
		const repoName = user + '-' + this.parseName().name
		const description = this.package.description
		const script =
			'bash ' + path.join(process.cwd(), 'scripts', 'github-create.sh')
		let data = await this.exec(
			`${script} ${user} ${pw} ${repoName} "${description}"`,
		)
		data.print()
		data = await this.gitCommit()
		data.print()
	}

	keywords(...words) {
		this.packageWrite((pack) => {
			pack.keywords = words
			return pack
		})
	}

	getJsDocDescription() {
		const lines = splitLines(this.getSrcEntry())
		let index
		for (let i = 0, len = lines.length; i < len; i++) {
			const line = lines[i]
			if (line.indexOf('/**') === 0) {
				index = i + 1
				break
			}
		}
		if (lines[index].includes('@')) {
			if (!lines[index].includes('@desc')) {
				return ''
			}
		}
		return lines[index].replace('*', '').trim()
	}

	description(str) {
		if (!str) {
			str = this.getJsDocDescription()
		}
		if (str.length !== 0) {
			this.packageWrite((pack) => {
				pack.description = str
				return pack
			})
		}
	}
})()

// cli
const main = async () => {
	try {
		const args = process.argv
		args.shift()
		args.shift()
		const methodName = args.shift()
		return await repo[methodName](...args)
	} catch (err) {
		console.log(err)
	}
}

// run main
main()
	.then((retValue) => {
		if (retValue !== undefined) {
			process.stdout._write(retValue)
		}
		process.exit(0)
	})
	.catch((err) => {
		console.log(err)
	})
