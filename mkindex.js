"use strict";

var fs = require('fs'),
    glob = require('glob'),
    util = require('util');


/**
 * Source file object
 **/
function SourcePath(path) {
    this.path = path;
}
SourcePath.prototype = {
    getCategory: function () {
        var path = this.path.replace('developer.mozilla.org/en/JavaScript/Reference/', '');
        var x = path.match(/^([^/]+)\//);
        if (x) {
            return x[1];
        } else {
            return 'Misc';
        }
    },
    getTitle: function () {
        var p = this.path;
        p = p.replace('developer.mozilla.org/en/JavaScript/Reference/', '');
        p = p.replace(/^([^\/]+)\//, '');
        p = p.replace(/_/g, ' ');
        p = p.replace(/\//g, '.');
        p = p.replace(/\.1/g, '');
        return p;
    },
    toMap: function() {
        return {
            title: this.getTitle(),
            path: this.path,
            category: this.getCategory()
        };
    }
};

/**
 * main routine
 **/
var ret = new Array();
var matches = glob.globSync('developer.mozilla.org/**/*', glob.GLOB_STAR);
matches.forEach(function (fname) {
    if (fs.statSync(fname).isDirectory()) { return; }

    var spath = new SourcePath(fname);
    ret.push(spath.toMap());
});

util.puts(JSON.stringify(ret));

