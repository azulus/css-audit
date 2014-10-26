var fs = require('fs');
var css = require('css');

var ASTLinter = function(linters){
    this._linters = linters;
};

ASTLinter.prototype.getSource = function (context, node) {
    var lines = [], position = node.position;
    for (var i = position.start.line - 1; i <= position.end.line - 1; i++)  {
        lines.push(
            context.sourceLines[i].substr(
                    i === position.start.line - 1 ? position.start.column - 1 : 0,
                    i === position.end.line - 1 ? position.end.column - 1 : undefined
            )
        );
    }
    return lines.join("\n");
};

ASTLinter.prototype.reportNode = function (context, node, msg) {
    context.errors.push({
        level: context.currentLinter.level,
        name: context.currentLinter.name,
        position: node.position,
        msg: msg
    });
};

ASTLinter.prototype.handle = function (type, node, context) {
    var linterFields = context.linterFields[type];
    if (typeof linterFields !== 'undefined') {
        for (var i = 0; i < linterFields.length; i++) {
            context.currentLinter = linterFields[i].linter;
            linterFields[i].fields[type](node);
        }
    }
}

ASTLinter.prototype.enter = function (node, context) {
    this.handle(node.type, node, context);
};

ASTLinter.prototype.exit = function (node, context) {
    this.handle(node.type + ':exit', node, context);
};

ASTLinter.prototype.createContext = function (source) {
    var context = {
        linterFields: {},
        errors:[],
        helper:{},
        sourceLines: source.split("\n")
    };

    context.helper.reportNode = this.reportNode.bind(this, context);
    context.helper.getSource = this.getSource.bind(this, context);

    for (var i = 0; i < this._linters.length; i++) {
        var linter = this._linters[i];
        var linterFields = linter.fn(context.helper);
        for (var key in linterFields) {
            if (typeof context.linterFields[key] === 'undefined') {
                context.linterFields[key] = [];
            }
            context.linterFields[key].push({fields:linterFields, linter:linter});
        }
    }
    return context;
};

ASTLinter.prototype.lint = function (source, ast) {
    var context = this.createContext(source);
    this.traverse(ast, context);
    return context.errors;
};

ASTLinter.prototype.lintFile = function (filename) {
    var source = fs.readFileSync(filename, 'utf8');
    var ast = css.parse(source, {
        source: filename
    });
    return this.lint(source, ast);
};

ASTLinter.prototype.traverse = function (node, context) {
    if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
            this.traverse(node[i], context);
        }
        return;
    }

    if (typeof node.type === 'string') this.enter(node, context);
    for (var key in node) {
        if (typeof node[key] === 'object') {
            this.traverse(node[key], context);
        }
    }
    if (typeof node.type === 'string') this.exit(node, context);
};

module.exports = ASTLinter;
