"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeClassNameFromPath = undefined;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeClassNameFromPath = exports.makeClassNameFromPath = function makeClassNameFromPath(path) {
    return path.split(_path2.default.sep).reverse().find(function (x) {
        return x !== "index.js";
    }).replace(/(^.*)\.\w+$/, '$1').replace(/\W+/g, '_');
};