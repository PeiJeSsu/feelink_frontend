module.exports = {
    testEnvironment: "jsdom",
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/index.js",
        "!src/reportWebVitals.js",
        "!src/App.test.js",
        "!src/App.js",
    ],
    coverageReporters: ["text", "lcov", "html"],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    transformIgnorePatterns: ["node_modules/(?!(axios|@erase2d/fabric)/)"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
    moduleNameMapping: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
    },
};
