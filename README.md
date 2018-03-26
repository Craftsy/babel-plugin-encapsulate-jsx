babel-plugin-encapsulate-jsx
============================

TLDR; A babel plugin to auto-generate CSS classnames for JSX components.

This plugin uses the filename to generate a CSS classname for all JSX elements in that file.

We're pretty aggressive here, and there are more optimal ways to add class names everywhere. However, with gzip, the additional bytesize for adding this complexity is pretty minimal.

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

By default the plugin will add a className attribute to every JSX element except React.Fragment and Fragment elements as those cannot receive properties. You can override this default list of exclusions and add your own with the `ignoredElements` configuration:

```
{
    "presets": ["es2015", "react"],
    "plugins": [
        ["babel-plugin-encapsulate-jsx", {ignoredElements: ['React.Fragment', 'Fragment', 'IgnoreThis', 'IgnoreThat']}]
    ]
}
```

Building
--------
`npm run test` runs the tests against the ES6 src code.

`npm run build` transpiles the encapsulate code into the `dist` directory.

