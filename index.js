var fs = require('fs');
var path = require('path');

var ASTLinter = require('./lib/ASTLinter');

module.exports = {
    getLinters: function (dir, levels) {
        var linters = [];
        for (var key in levels) {
            var level = levels[key];
            if (level === 0) continue;

            var filename = path.join(dir, key);
            var fn = require(filename);
            if (!fn) throw new Error(filename + ' does not exist');

            linters.push({
                name: key,
                level: level,
                fn: fn
            })
        }
        return linters;
    },
    ASTLinter: ASTLinter
};
