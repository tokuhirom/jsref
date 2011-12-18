"use strict";

var fs = require('fs'),
    glob = require('glob'),
    util = require('util'),
    async = require('async');


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
    getESVersion: function () { // ecmascript version
        jsdom.env('<p><a class="the-link" href="http://jsdom.org>JSDOM\'s Homepage</a></p>', [
            'http://code.jquery.com/jquery-1.5.min.js'
            ], function (err, window) {
                if (err) { throw err; }
                var h = console.log(window.$('.standard-table').text());
            }
        );
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
        async.reduce(matches, [], function (memo, fname, callback) {
            var spath = new SourcePath(fname);
            process.nextTick(function () {
                memo.push(spath.toMap());
                callback(null, memo);
            });
        }, function (err, result) {
            cb(err, result);
        });
    },
    function (ret, cb) {
        util.puts(JSON.stringify(ret));
        cb(null);
    }
]);

