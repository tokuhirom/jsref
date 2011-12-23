"use strict";

var fs = require('fs'),
    glob = require('glob'),
    util = require('util'),
    nquery = require('nquery'),
    assert = require('assert');

/**
 * Source file object
 **/
function SourcePath(path) {
    assert(path);
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
        assert(this.path);

        var p = this.path;
        p = p.replace('developer.mozilla.org/en/JavaScript/Reference/', '');
        p = p.replace(/^([^\/]+)\//, '');
        p = p.replace(/_/g, ' ');
        p = p.replace(/\//g, '.');
        p = p.replace(/\.1/g, '');
        return p;
    },
    getESVersion: function () { // ecmascript version
        var src = this.getContent();
        var q = nquery.createHtmlDocument(src);
        var h = q('.standard-table').html();
        var version = null;
        if (h) {
            var matched = h.match(new RegExp('<td>ECMAScript Edition</td>[\s\n ]*<td>([^<]+)</td>'));
            if (matched) {
                version = matched[1];
                // ECMA-262 3rd Edition
                // ECMA-262
                version = version.replace('ECMA-262 3rd Edition', '5');
                version = version.replace('ECMA-262', '5');
                version = version.replace(/^ECMAScript /, '');
                version = version.replace(/^None, .+/, 'none');
                version = version.replace(/(st|nd|rd|th) Edition$/, '');
                // None (Harmony Proposal)
                version = version.replace(/\s*\(.+$/, '');
                if (version.toLowerCase() === 'none') {
                    version = null;
                }
            } else {
                // console.log(h);
            }
        }
        return version;
    },
    getContent: function () {
        if (!this.content) {
            this.content = fs.readFileSync(this.path, 'utf-8');
        }
        return this.content;
    },
    isDeprecated: function () {
        var src = this.getContent();
        return !!src.match(/<p[^>]+>Deprecated<\/p>/);
    },
    isNonStandard: function () {
        var src = this.getContent();
        return !!src.match(/<p[^>]+>Non-standard<\/p>/);
    },
    toMap: function(cb) {
        assert(this.path);
        return {
            title: this.getTitle(),
            path: this.path,
            category: this.getCategory(),
            esversion: this.getESVersion(),
            nonstandard: this.isNonStandard(),
            deprecated: this.isDeprecated(),
        };
    }
};

/**
 * main routine
 **/
var matches = glob.globSync('developer.mozilla.org/**/*', glob.GLOB_STAR);

var ret = matches.filter(function (path) {
    return !fs.statSync(path).isDirectory();
}).map(function (fname) {
    var spath = new SourcePath(fname);
    return spath.toMap();
});
util.puts(JSON.stringify(ret));

