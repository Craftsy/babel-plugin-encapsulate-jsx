babel-plugin-encapsulate-jsx
============================

TLDR; A babel plugin to auto-generate CSS classnames for JSX components.

This plugin user the filename to generate a CSS classname for all JSX elements in that file.

We're pretty aggressive here and there are more optimal ways to add class names everywhere. However, with gzip, the additional bytesize for adding this complexity are pretty minimal.

Use
---

Install with `npm install --save-dev babel-plugin-encapsulate-jsx`. Then, add the plugin section to your .babelrc:

`.babelrc`:
```
{
    "presets": ["es2015", "react"],
    "plugins": ["babel-plugin-encapsulate-jsx"]
}
```

Building
--------
`npm run test` runs the tests against the ES6 src code.

`npm run build` transpiles the encapsulate code into the `dist` directory.

