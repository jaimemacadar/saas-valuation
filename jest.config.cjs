module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/cache$": "<rootDir>/src/__mocks__/next-cache.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/core/", // Testes do core rodam com Vitest
  ],
};
