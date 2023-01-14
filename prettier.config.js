module.exports = {
  plugins: [require('prettier-plugin-tailwindcss')],

  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  importOrder: ['^[./]', '^@/(.*)$', '^@src/(.*)$'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
