import fs from 'fs';
import path from 'path';
import findup from 'findup-sync';
import at from 'lodash.at';

function simpleCache(f) {
    const cache = {};
    return (k) => {
        if (!cache[k]) {
            cache[k] = f(k);
        }
        return cache[k];
    };
}

export default function EncapsulateJsx({types: t}) {
    const packagePathCache = simpleCache((directory) => {
        const packagePath = findup('package.json', {cwd: directory});
        if (!packagePath) {
            throw new Error(`Unable to find a package.json in ${directory} or its ancestors.`);
        }
        return packagePath;
    });
    const pkgFromPath = (packagePath) => JSON.parse(fs.readFileSync(packagePath));
    const classnameFromPkg = (pkg) => `${pkg.name.replace(/[@\/]/g, '_')}_${pkg.version.replace(/\./g, '_')}`;
    const isAppliedFromPkg = (optIn, optKey) => (pkg) => {
        const optVal = at(pkg, optKey)[0];
        if (optIn) {
            if (!optVal) return false;
        } else { // optOut
            if (optVal) return false;
        }
        return true;
    };
    const processPackage = (optIn, optKey) => {
        const calcIsApplied = isAppliedFromPkg(optIn, optKey);
        return simpleCache((filename)=>{
            const directory = path.join(process.cwd(), path.dirname(filename));
            const packagePath = packagePathCache(directory);
            const pkg = pkgFromPath(packagePath);
            const isApplied = calcIsApplied(pkg);
            return {isApplied, className: isApplied ? classnameFromPkg(pkg) : undefined};
        });
    };
    // big assumption here that state.opts is immutable
    const getProcessPackageForOpts = simpleCache(({
            optIn=false, // optOut by default (by including this plugin you're opting in)
            optKey='cssMain', // keyPath for optIn or optOut
            // TODO: let someone specify a pattern to use via package.json
        })=>processPackage(optIn, optKey));
    return {
        visitor: {
            JSXOpeningElement: function transform(path, state) {
                if (path.node.encapsulatedAlready) {
                    return;
                }
                const processPackage = getProcessPackageForOpts(state.opts);
                const filename = state.file.log.filename;
                const {isApplied, className} = processPackage(filename);
                if (!isApplied) return;

                const classnameAttributes = path.node.attributes
                    .filter(a=>t.isJSXAttribute(a) && t.isJSXIdentifier(a.name, {name: 'className'}));
                if (!classnameAttributes.length) {
                    const node = t.jSXOpeningElement(
                        path.node.name,
                        path.node.attributes.concat([t.jSXAttribute(
                            t.jSXIdentifier('className'),
                            t.stringLiteral(className)
                        )]),
                        path.node.selfClosing
                    );
                    node.encapsulatedAlready = true;
                    path.replaceWith(node);
                } else {
                    classnameAttributes.forEach((attr)=>{
                        if (t.isStringLiteral(attr.value)) {
                            const node = t.jSXOpeningElement(
                                path.node.name,
                                path.node.attributes.map((curAttr)=>{
                                    if (attr !== curAttr) return curAttr;
                                    return t.jSXAttribute(
                                        t.jSXIdentifier('className'),
                                        t.stringLiteral(`${attr.value.value} ${className}`)
                                    );
                                }),
                                path.node.selfClosing
                            );
                            node.encapsulatedAlready = true;
                            path.replaceWith(node);
                        } else if (t.isJSXExpressionContainer(attr.value)) {
                            const node = t.jSXOpeningElement(
                                path.node.name,
                                path.node.attributes.map((curAttr)=>{
                                    if (attr !== curAttr) return curAttr;
                                    return t.jSXAttribute(
                                        t.jSXIdentifier('className'),
                                        t.jSXExpressionContainer(
                                            t.binaryExpression(
                                                '+',
                                                attr.value.expression,
                                                t.stringLiteral(` ${className}`)
                                            )
                                        )
                                    );
                                }),
                                path.node.selfClosing
                            );
                            node.encapsulatedAlready = true;
                            path.replaceWith(node);
                        } else {
                            throw new Error('Babel Plugin Encapsulate JSX: unknown attribute type');
                        }
                    });
                }
            },
        },
    };
}
