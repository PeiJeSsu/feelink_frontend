module.exports = {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(js|jsx)$": "babel-jest",
	},
	moduleNameMapper: {
		"\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
		"\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
	},
	transformIgnorePatterns: ["/node_modules/(?!(@mui|@babel|@emotion)/)"],
};
