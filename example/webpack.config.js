const path = require("path");
module.exports = {
	resolve: {
		extensions: [".ts", ".js"],
	},
	entry: ["./out/index.js"],
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "public"),
	},
	// optimization: { minimize: false },
};
