module.exports = {
	/** Globs to analyze */
	globs: ["lib/**/*.ts"],
	/** Directory to output CEM to */
	outdir: "./dist",
	/** Run in dev mode, provides extra logging */
	dev: false,
	/** Enable special handling for FastElement */
	fast: true,
	/** Include third party custom elements manifests */
	dependencies: true,
	/** Output CEM path to `package.json`, defaults to true */
	packagejson: true,
};
