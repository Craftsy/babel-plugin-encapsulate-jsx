const nodepath = require('path');
const classnameFromFilename = (filename) => filename.replace(/(^.*)\..*/, '$1').replace(/\W+/g, '_');

module.exports = function EncapsulateJsx({types: t}) {
    return {
        visitor: {
            Program: function transform(path, state) {
                const fileComments = path.parent.comments;
                if (fileComments && fileComments.length) {
                    if (fileComments.filter(comment => comment.value.indexOf('disable-encapsulation') !== -1).length > 0) {
                        state.disableEncapsulation = true;
                    }
                }
            },

            JSXOpeningElement: function transform(path, state) {
                if (path.node.encapsulatedAlready || state.disableEncapsulation === true) {
                    return;
                }
                const filename = nodepath.basename(state.file.log.filename);
                const className = classnameFromFilename(filename);

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
