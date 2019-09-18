module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/*.{d.ts,.test.ts}"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100
    }
  },
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"]
};
