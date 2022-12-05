module.exports = {
  extends: ['@affinidi/eslint-config'],
  parserOptions: { project: ['tsconfig.json'] },
  rules: {
    'no-restricted-syntax': 'off',
  },
  overrides: [
    {
      extends: ['@affinidi/eslint-config'],
      parserOptions: { project: ['tsconfig.json'] },
      files: ['src/test/**/**/*.ts'],
      env: { jest: true },
      plugins: ['security'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
}
