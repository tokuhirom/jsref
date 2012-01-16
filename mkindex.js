"use strict";
/**
 * Make index.json from doc.db.
 **/

var fs = require('fs'),
    util = require('util'),
    nquery = require('nquery'),
    DB = require('./lib/DB').DB,
    assert = require('assert'),
    Url = require('url'),
    querystring = require('querystring'),
    crypto = require('crypto'),
    libxml = require('libxmlext'),
    undefined;

var srcdb = new DB('docs.db');

/**
 * Source file object
 **/
function SourcePath(path, content) {
    assert(path);
    this.path = path;
    this.content = content;
}
SourcePath.prototype = {
    getCategory: function () {
        var path = this.path.replace('/en/JavaScript/Reference/', '');
        var x = path.match(/^([^/]+)\//);
        if (x) {
            return x[1].replace(/_/g, ' ').replace(/^[a-z]/, function (x) {
                return x.toUpperCase();
            });
        } else {
            return 'Misc';
        }
    },
    getTitle: function () {
        assert(this.path);

        if (this.path === '/en/JavaScript/Reference') {
            return 'Top';
        }

        var p = this.path;
        p = p.replace('/en/JavaScript/Reference/', '');
        p = p.replace(/^([^\/]+)\//, '');
        p = p.replace(/_/g, ' ');
        p = p.replace(/\//g, '.');
        p = p.replace(/\.1/g, '');
        return p;
    },
    getESVersion: function () { // ecmascript version
        var src = this.getContent();
        var doc = libxml.parseHtmlString(src);
        var h = doc.root().find("//table[@class='standard-table']").toString();
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
    getUrl: function () {
        var md5 = crypto.createHash('md5');
        md5.update(this.path);
        return 'converted/' + md5.digest('hex');
    },
    getContent: function () {
        return this.content;
    },
    isDeprecated: function () {
        var src = this.getContent();
        return !!src.match(/<p[^>]+>Deprecated<\/p>/);
    },
    isObsolete: function () {
        var src = this.getContent();
        return !!src.match(/<p[^>]+>Obsolete<\/p>/);
    },
    isNonStandard: function () {
        var src = this.getContent();
        return !!src.match(/<p[^>]+>Non-standard<\/p>/);
    },
    toMap: function(cb) {
        assert(this.path);
        if (this.getContent().match(/Browse Thousands of Docs for/)) {
            return null;
        }
        return {
            title: this.getTitle(),
            path: this.path,
            category: this.getCategory(),
            esversion: this.getESVersion(),
            nonstandard: this.isNonStandard(),
            deprecated: this.isDeprecated(),
            obsolete: this.isObsolete(),
            url: this.getUrl(),
        };
    }
};

/**
 * main routine
 **/
var ret = srcdb.listUrls().sort().map(function (url) {
    var content = srcdb.fetch(url);
    var path = Url.parse(url).pathname;
    var spath = new SourcePath(path, content);
    return spath.toMap();
}).filter(function (e) { return e });
util.puts(JSON.stringify(ret, null, 4));

