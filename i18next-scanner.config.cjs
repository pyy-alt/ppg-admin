module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/js/**',
    '!src/assets/**',
    '!src/**/routeTree.gen.*',
    '!src/**/routeTree.gen.ts',
  ],
  output: 'src/locales',
  options: {
    debug: false,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    lngs: ['en', 'fr'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    resource: {
      loadPath: 'src/locales/{{lng}}.json',
      savePath: 'src/locales/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    lexers: {
      ts: ['JavascriptLexer'],
      tsx: ['JsxLexer'],
      js: ['JavascriptLexer'],
      jsx: ['JsxLexer'],
    },
    removeUnusedKeys: false,
    sort: true,
  },
};
