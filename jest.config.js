module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/*.{d.ts,.test.ts}"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80
    }
  },
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"]
};
