module.exports = function (context) {
    var attributeStack = [];

    var currentRule = function() {
        return attributeStack[attributeStack.length - 1];
    };

    return {
        "rule": function (node) {
            attributeStack.push({
                node: node,
                attributes: []
            });
        },

        "rule:exit": function (node) {
            attributeStack.pop();
        },

        "declaration": function (node) {
            var rule = currentRule();

            if (!rule) {
                context.reportNode, 'What the fuck is this: ' + context.getSource(node);
                return;
            }

            if (rule.attributes.length === 0 ||
                    node.property >= rule.attributes[rule.attributes.length - 1]) {
                rule.attributes.push(node.property);
            } else {
                context.reportNode(node, 'CSS rules should be alphabetized: ' +
                    context.getSource(rule.node));
            }
        }
    }
};
