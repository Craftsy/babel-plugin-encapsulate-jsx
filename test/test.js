/* global describe, it */
import {transform} from 'babel-core';
import {expect} from 'chai';
import {minify} from 'uglify-js';

// This is a little utility to make it easier to compare code generated;
// Generated code may be syntatically equivalent but not strictly equivalent.
const u = (code)=> minify(code, {fromString: true, mangle: false}).code;

const encapsulateTransformOptions = {
    plugins: [
        '../index',
        ['transform-react-jsx', { pragma: 'j' } ],
    ],
    filename: './test/fixtures/yay.js',
    filenameRelative: 'test/fixtures/yay.js',
};
const jsxOnlyTransformOptions = {
    plugins: [
        ['transform-react-jsx', { pragma: 'j' } ],
    ],
    // For some reason, without filename use strict is disabled... silly babel code plugins
    filename: 'STUPIDNESS',
    filenameRelative: 'DUE TO USE STRICT',
};

describe('encapsulate-jsx', function() {
    const className = 'yayness_5_6_7'; // name generated from fixtures/package.json
    describe('configuration', function() {
        it('defaults to optOut');
        it('can be set to optIn');
        it('uses the truthiness of optKey to determine optIn/optOut');
        it('defaults optKey to cssMain');
    });
    describe('preconditions', function() {
        it('filenameRelative (relative to cwd) must be specified so log filename can be found');
    });
    describe('encapsulation', function() {
        it('can encapsulate a JSX Element with no attributes', function() {
            const code = '<Blue/>';
            const expectedCode = `<Blue className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate nested JSX elements with no attributes', function() {
            const code = '<Blue><Red/></Blue>';
            const expectedCode = `<Blue className="${className}"><Red className="${className}"/></Blue>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a single attribute', function() {
            const code = '<Blue red="no"/>';
            const expectedCode = `<Blue red="no" className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a classname attribute string', function() {
            const code = '<Blue className="no"/>';
            const expectedCode = `<Blue className="no ${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a classname attribute expression', function() {
            const code = '<Blue className={"blue"}/>';
            const expectedCode = `<Blue className={"blue ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a complex classname attribute expression', function() {
            const code = '<Blue className={yay ? "veryYay" : "boo"}/>';
            const expectedCode = `<Blue className={(yay ? "veryYay" : "boo") + " ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute', function() {
            const code = '<Blue {...yay}/>';
            const expectedCode = `<Blue {...yay} className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute and a className', function() {
            const code = '<Blue className="red" {...yay}/>';
            const expectedCode = `<Blue className="red ${className}" {...yay}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute and a classname inside (sorry, it\`s hacky)', function() {
            const code = '<Blue {...yay} className={yay.className}/>';
            const expectedCode = `<Blue {...yay} className={yay.className + " ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
    });
});
