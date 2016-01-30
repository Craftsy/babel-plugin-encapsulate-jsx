'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = EncapsulateJsx;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findupSync = require('findup-sync');

var _findupSync2 = _interopRequireDefault(_findupSync);

var _lodash = require('lodash.at');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function simpleCache(f) {
    var cache = {};
    return function (k) {
        if (!cache[k]) {
            cache[k] = f(k);
        }
        return cache[k];
    };
}

function EncapsulateJsx(_ref) {
    var t = _ref.types;

    var packagePathCache = simpleCache(function (directory) {
        var packagePath = (0, _findupSync2.default)('package.json', { cwd: directory });
        if (!packagePath) {
            throw new Error('Unable to find a package.json in ' + directory + ' or its ancestors.');
        }
        return packagePath;
    });
    var pkgFromPath = function pkgFromPath(packagePath) {
        return JSON.parse(_fs2.default.readFileSync(packagePath));
    };
    var classnameFromPkg = function classnameFromPkg(pkg) {
        return pkg.name.replace(/[@\/]/g, '_') + '_' + pkg.version.replace(/\./g, '_');
    };
    var isAppliedFromPkg = function isAppliedFromPkg(optIn, optKey) {
        return function (pkg) {
            var optVal = (0, _lodash2.default)(pkg, optKey)[0];
            if (optIn) {
                if (!optVal) return false;
            } else {
                // optOut
                if (optVal) return false;
            }
            return true;
        };
    };
    var processPackage = function processPackage(optIn, optKey) {
        var calcIsApplied = isAppliedFromPkg(optIn, optKey);
        return simpleCache(function (filename) {
            var directory = _path2.default.dirname(filename);
            var packagePath = packagePathCache(directory);
            var pkg = pkgFromPath(packagePath);
            var isApplied = calcIsApplied(pkg);
            return { isApplied: isApplied, className: isApplied ? classnameFromPkg(pkg) : undefined };
        });
    };
    // big assumption here that state.opts is immutable
    var getProcessPackageForOpts = simpleCache(function (_ref2) {
        var _ref2$optIn = _ref2.optIn;
        var optIn = _ref2$optIn === undefined ? false : _ref2$optIn;
        var _ref2$optKey = _ref2.optKey;
        var // optOut by default (by including this plugin you're opting in)
        optKey = _ref2$optKey === undefined ? 'cssMain' : _ref2$optKey;
        return (// keyPath for optIn or optOut
            // TODO: let someone specify a pattern to use via package.json
            processPackage(optIn, optKey)
        );
    });
    return {
        visitor: {
            JSXOpeningElement: function transform(path, state) {
                if (path.node.encapsulatedAlready) {
                    return;
                }
                var processPackage = getProcessPackageForOpts(state.opts);
                var filename = state.file.log.filename;

                var _processPackage = processPackage(filename);

                var isApplied = _processPackage.isApplied;
                var className = _processPackage.className;

                if (!isApplied) return;

                var classnameAttributes = path.node.attributes.filter(function (a) {
                    return t.isJSXAttribute(a) && t.isJSXIdentifier(a.name, { name: 'className' });
                });
                if (!classnameAttributes.length) {
                    var node = t.jSXOpeningElement(path.node.name, path.node.attributes.concat([t.jSXAttribute(t.jSXIdentifier('className'), t.stringLiteral(className))]), path.node.selfClosing);
                    node.encapsulatedAlready = true;
                    path.replaceWith(node);
                } else {
                    classnameAttributes.forEach(function (attr) {
                        if (t.isStringLiteral(attr.value)) {
                            var node = t.jSXOpeningElement(path.node.name, path.node.attributes.map(function (curAttr) {
                                if (attr !== curAttr) return curAttr;
                                return t.jSXAttribute(t.jSXIdentifier('className'), t.stringLiteral(attr.value.value + ' ' + className));
                            }), path.node.selfClosing);
                            node.encapsulatedAlready = true;
                            path.replaceWith(node);
                        } else if (t.isJSXExpressionContainer(attr.value)) {
                            var node = t.jSXOpeningElement(path.node.name, path.node.attributes.map(function (curAttr) {
                                if (attr !== curAttr) return curAttr;
                                return t.jSXAttribute(t.jSXIdentifier('className'), t.jSXExpressionContainer(t.binaryExpression('+', attr.value.expression, t.stringLiteral(' ' + className))));
                            }), path.node.selfClosing);
                            node.encapsulatedAlready = true;
                            path.replaceWith(node);
                        } else {
                            throw new Error('Babel Plugin Encapsulate JSX: unknown attribute type');
                        }
                    });
                }
            }
        }
    };
}