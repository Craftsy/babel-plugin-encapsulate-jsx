babel-plugin-encapsulate-jsx
============================

At Craftsy, we use a [monorepo](http://danluu.com/monorepo/): each React component is in it's own npm package.

`src/example/package.json`:
```json
{
  "name": "@craftsy/example",
  "version": "1.0.0"
}
```

`src/example/index.js`:
```javascript
import React from 'react';

export default Example({text, url, background, imgUrl, imgAlt}) {
    return (
        <div className="example" style={{backgroundImage: `url(${background})`}}>
            <h2>{text}</h2>
            <a href={url}>
                <div className="awesomeness">
                    <img src={imgUrl} alt={imgAlt}/>
                </div>
            </a>
        </div>
    );
}
```

`src/example/yay.css`:
```css
.example {
    background: #00ff00 no-repeat fixed center;
}

.awesomeness {
    border: 1px solid black;
}
```

We realized that to maximize component reuse, we'd have to make sure that css is scoped to just that component AND it's version (so we could potentially have 2 versions of one component on a page). We could just use BEM or a namespacing pattern, but then we'd have to change the CSS and JSX EVERY time we pushed a new version. We also knew we'd make a lot of mistakes.

**So we automated namespacing.**

This plugin reads the package name and version from the nearest package.json and namespaces the JSX in all files to use it.

`src/example/dist/index.js` after this plugin runs:
```javascript
import React from 'react';

export default Example({text, url, background, imgUrl, imgAlt}) {
    return (
        <div className="example _craftsy_example_1_0_0" style={{backgroundImage: `url(${background})`}}>
            <h2 className="_craftsy_example_1_0_0">{text}</h2>
            <a className="_craftsy_example_1_0_0" href={url}>
                <div className="awesomeness _craftsy_example_1_0_0">
                    <img className="_craftsy_example_1_0_0" src={imgUrl} alt={imgAlt}/>
                </div>
            </a>
        </div>
    );
}
```

`src/example/dist/index.css` after [the css plugin](TODO) runs:
```css
.example._craftsy_example_1_0_0 {
    background: #00ff00 no-repeat fixed center;
}

.awesomeness._craftsy_example_1_0_0 {
    border: 1px solid black;
}
```

We're pretty aggressive here and there are more optimal ways to add class names everywhere. However, with gzip, the gains for adding this complexity are pretty minimal.

Use
---

Install with `npm install --save-dev babel-plugin-encapsulate-jsx`. Then, add the plugin section to your .babelrc:

`.babelrc`:
```
{
    "presets": ["es2015"],
    "plugins": ["encapsulate-jsx", "transform-react-jsx"]
}
```

If for some reason you are using babel programatically:

```javascript
babel.transform(code, {
    plugins: ['encapsulate-jsx'],
}).code
```

Configuration
-------------

By including this plugin, it assumes you want to encapsulate all the files. This obviously isn't true for all cases.

Configuring this plugin to not encapsulate a package with a specific `package.json` flag:

`.babelrc`:
```
{
    "presets": ["es2015"],
    "plugins": [
        ["encapsulate-jsx", {
          "optKey": "dontEncapsulate"
        }],
        "transform-react-jsx"
    ]
}
```

`src/example/package.json` will be encapsulated:
```json
{
  "name": "@craftsy/example",
  "version": "1.0.0"
}
```

`src/example2/package.json` will NOT be encapsulated:
```json
{
  "name": "@craftsy/example2",
  "version": "1.0.0",
  "dontEncapsulate": true
}
```

`src/example3/package.json` will be encapsulated:
```json
{
  "name": "@craftsy/example3",
  "version": "1.0.0",
  "dontEncapsulate": false
}
```

Configuring this plugin to optIn instead of optOut:

`.babelrc`:
```
{
    "presets": ["es2015"],
    "plugins": [
        ["encapsulate-jsx", {
          "optIn": true,
          "optKey": "encapsulated"
        }],
        "transform-react-jsx"
    ]
}
```

`src/example/package.json` will NOT be encapsulated:
```json
{
  "name": "@craftsy/example",
  "version": "1.0.0"
}
```

`src/example2/package.json` will be encapsulated:
```json
{
  "name": "@craftsy/example2",
  "version": "1.0.0",
  "encapsulated": true
}
```

`src/example3/package.json` will NOT be encapsulated:
```json
{
  "name": "@craftsy/example3",
  "version": "1.0.0",
  "encapsulated": false
}
```

In the future we may support regex through `optRegex`: Feel free to make a PR!

Building
--------
`npm run test` runs the tests against the ES6 src code.

`npm run build` transpiles the encapsulate code into the `dist` directory.

