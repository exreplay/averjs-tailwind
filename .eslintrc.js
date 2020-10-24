module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'standard',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    'import/no-unresolved': 0,

    'array-bracket-spacing': [ 'error', 'always' ],

    'no-useless-catch': 0,
    
    indent: [ 'error', 2, { MemberExpression: 'off' } ],
    
    'generator-star-spacing': 'off',
    
    'no-tabs': 'off',

    'prefer-promise-reject-errors': [ 'error', {
      allowEmptyReject: true
    } ],

    'no-multi-spaces': [ 'error', {
      exceptions: {
        ImportDeclaration: true
      }
    } ],

    semi: [ 'error', 'always' ],

    'space-before-function-paren': [ 'error', 'never' ],
    
    'no-trailing-spaces': [ 'error', {
      skipBlankLines: true
    } ]
  }
};
