"use strict";

var fs = require('fs'),
    glob = require('glob'),
    util = require('util'),
    async = require('async'),
    jsdom = require('jsdom'),
    assert = require('assert');
var jquery = fs.readFileSync("./js/jquery-1.7.1.min.js").toString();

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
    getESVersion: function (callback) { // ecmascript version
        var that = this;
        async.waterfall([
            function (cb) {
                fs.readFile(that.path, 'utf-8', function (err, dat) {
                    cb(err, dat);
                });
            },
            function (src, cb) {
                jsdom.env({
                    html: src,
                    src: [
                        jquery
                    ],
                    done: function (err, window) {
                        if (err) { cb(err); return; }

                        var h = window.$('.standard-table').html();
                        var version = null;
                        if (h) {
                            var matched = h.match(new RegExp('<td>ECMAScript Edition</td>[\s\n ]*<td>([^<]+)</td>'));
                            if (matched) {
                                version = matched[1];
                                version = version.replace('ECMA-262', '5');
                                version = version.replace(/^ECMAScript /, '');
                                version = version.replace(/(st|nd|rd|th) Edition$/, '');
                                if (version.toLowerCase() === 'none') {
                                    version = null;
                                }
                            } else {
                                // console.log(h);
                            }
                        }
                        window.close();

                        callback(null, version);
                        cb(null); // done
                    }
                });
            }
        ], function (err) {
            callback(err);
        });
    },
    toMap: function(cb) {
        assert(this.path);
        var ret = {
            title: this.getTitle(),
            path: this.path,
            category: this.getCategory()
        };
        this.getESVersion(function (err, version) {
            ret.esversion = version;
            cb(null, ret);
        });
    }
};

/**
 * main routine
 **/
var matches = glob.globSync('developer.mozilla.org/**/*', glob.GLOB_STAR);
async.waterfall([
    function (cb) {
        async.filter(matches, function (path, cb) {
            fs.stat(path, function (err, stat) {
                if (err) { throw err; }
                cb(!stat.isDirectory());
            });
        }, function (matches) {
            cb(null, matches);
        });
    },
    function (matches, cb) {
        // console.log(matches);
        async.reduce(matches, [], function (memo, fname, callback) {
            // util.print('.');
            // if (memo.length>10) { callback(null, memo); return; }
            if (!fname) { return; }
            assert(fname);
            var spath = new SourcePath(fname);
            spath.toMap(function (err, result) {
                if (err) { callback(err); return; };
                // console.log(result);
                memo.push(result);
                callback(null, memo);
            });
        }, function (err, result) {
            cb(err, JSON.parse(JSON.stringify(result)));
            // cb(err, JSON.parse(JSON.stringify(result)));
        });
    },
    function (ret, cb) {
        util.puts(JSON.stringify(ret));
        cb(null);
    }
], function (err) {
    if (err) { throw err; }
});

