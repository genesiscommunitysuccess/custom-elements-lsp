const path = require("path");
module.exports = {
	entry: ["./out/index.js"],
	output: {
		library: {
			name: "example_lib",
			type: "var",
		},
	},
	// optimization: { minimize: false },
};
