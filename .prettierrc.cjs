/** @type {import("prettier").Config} */
module.exports = {
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  jsxBracketSameLine: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  parser: 'typescript',
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
}
