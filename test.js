var cssAudit = require('./index');
var path = require('path');

var linters = cssAudit.getLinters(path.join(__dirname, 'rules'), {
    'alphabetize-selectors': 2
});

var testFilename = path.join(__dirname, 'examples', 'test1.css');
var linter = new cssAudit.ASTLinter(linters);
console.log(linter.lintFile(testFilename));
