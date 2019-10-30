module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
  ],
  testMatch: [
    "**/(src|tests)/**/*.spec.(js|ts)",
  ],
}
