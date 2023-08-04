/* eslint-disable */
// wrapper around commitlint CLI allowing to check commit messages
const format = require('@commitlint/format').default;
const lint = require('@commitlint/lint').default;
const load = require('@commitlint/load').default;

const message = process.argv.slice(2).join(' ');

load({}, { file: 'commitlint.config.js', cwd: process.cwd() })
	.then((opts) =>
		lint(message, opts.rules, opts.parserPreset ? { parserOpts: opts.parserPreset.parserOpts } : {})
	)
	.then((report) => {
		if (report.valid) {
			console.log(`⧗   input: ${message}
✔   Commitlint check successful
`);
		} else {
			console.log(format({ results: [report] }));
		}
	});
