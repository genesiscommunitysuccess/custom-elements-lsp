module.exports = {
  extends: ['@commitlint/config-conventional', '@commitlint/config-lerna-scopes'],
  rules: {
    'references-empty': [2, 'never'],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['FUI-', 'ISSUE-'],
    },
  },
};
