'use strict';

var _require = require("./utils"),
    makeClassNameFromPath = _require.makeClassNameFromPath;

var defaultIgnoredElements = ['React.Fragment', 'Fragment'];

function doesElementNameMatch(elementNameNode, elements) {
    var elementIdentifierParts = [];

    var currentNode = elementNameNode;
    while (currentNode.type === 'JSXMemberExpression') {
        elementIdentifierParts.unshift(currentNode.property.name);
        currentNode = currentNode.object;
    }
    elementIdentifierParts.unshift(currentNode.name);

    var elementName = elementIdentifierParts.join('.');
    return elements.indexOf(elementName) !== -1;
}

module.exports = function EncapsulateJsx(_ref) {
    var t = _ref.types;

    return {
        visitor: {
            Program: function transform(path, state) {
                var fileComments = path.parent.comments;
                if (fileComments && fileComments.length) {
                    if (fileComments.filter(function (comment) {
                        return comment.value.indexOf('disable-encapsulation') !== -1;
                    }).length > 0) {
                        state.disableEncapsulation = true;
                    }
                }
            },

            JSXOpeningElement: function transform(path, state) {
                if (path.node.encapsulatedAlready || state.disableEncapsulation === true) {
                    return;
                }

                var ignoredElements = state.opts.ignoredElements || defaultIgnoredElements;
                if (doesElementNameMatch(path.node.name, ignoredElements)) {
                    return;
                }

                var className = makeClassNameFromPath(state.file.log.filename);

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
                            var _node = t.jSXOpeningElement(path.node.name, path.node.attributes.map(function (curAttr) {
                                if (attr !== curAttr) return curAttr;
                                return t.jSXAttribute(t.jSXIdentifier('className'), t.stringLiteral(attr.value.value + ' ' + className));
                            }), path.node.selfClosing);
                            _node.encapsulatedAlready = true;
                            path.replaceWith(_node);
                        } else if (t.isJSXExpressionContainer(attr.value)) {
                            var _node2 = t.jSXOpeningElement(path.node.name, path.node.attributes.map(function (curAttr) {
                                if (attr !== curAttr) return curAttr;
                                return t.jSXAttribute(t.jSXIdentifier('className'), t.jSXExpressionContainer(t.binaryExpression('+', attr.value.expression, t.stringLiteral(' ' + className))));
                            }), path.node.selfClosing);
                            _node2.encapsulatedAlready = true;
                            path.replaceWith(_node2);
                        } else {
                            throw new Error('Babel Plugin Encapsulate JSX: unknown attribute type');
                        }
                    });
                }
            }
        }
    };
};