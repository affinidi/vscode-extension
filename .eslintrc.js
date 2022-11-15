module.exports = {
  extends: ['@affinidi/eslint-config'],
  parserOptions: { project: ['tsconfig-tests.json'] },
  rules: {
    'no-restricted-syntax': 'off'
  },
  overrides: [
    {
      extends: ['@affinidi/eslint-config'],
      parserOptions: { project: ['tsconfig-tests.json'] },
      files: ['src/test/**/**/*.ts'],
      env: { jest: true },
      plugins: ['security'],
    },
  ],
}