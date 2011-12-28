"use strict";

var libxmlext = require('libxmlext'),
    fs = require('fs'),
    util = require('util'),
    request = require('request'),
    DB = require('./lib/DB').DB,
    url_ = require('url'),
    undefined;


function Crawler() {
    this.db = new DB('docs.db');
    // this.endpoint = "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/JSON";
    this.endpoint = "https://developer.mozilla.org/en/JavaScript/Reference";
    this.queue = new Array();
    this.queue.push(this.endpoint);
    this.seen = {};
    var self = this;
    setTimeout(function () {
        console.log(self.queue.length);
    }, 1000);
}
Crawler.prototype = {
    run: function () {
        if (this.queue.length === 0) {
            return;
        }

        var url = this.queue.shift();
        if (this.seen[url]) {
            console.log('[seen] ' + url);
            return;
        }

        console.log('[url] ' + url);

        var self = this;
        if (this.db.exists(url)) {
            var src = this.db.fetch(url);
            this.processBody(url, src);
        } else {
            request(url, function (error, response, body) {
                if (error) {
                    console.log(url + " : " + error);
                    self.run();
                    return;
                }
                if (response.statusCode !== 200) {
                    console.log(url + " : " + response.statusCode + " : " + body);
                    self.run();
                    return;
                }
                self.db.insert(url, body);
                self.processBody(url, body);
            });
        }
    },
    processBody: function (url, body) {
        var self = this;
        var doc = libxmlext.parseHtmlString(body);
        var inserted = 0;
        doc.find('//a').forEach(function (a) {
            // console.log('a: ' + a.toString());
            var href = a.attr('href');
            if (!href) { return; }
            var nextlink = '' + url_.resolve(url, href.value().replace(/#.*/, '')).toString();
            if (self.seen[nextlink]) {
                console.log('[seen2] ' + nextlink);
                return;
            }
            if (nextlink.match(/\/en\/JavaScript\/Reference\//)) {
                console.log('[push] ' + nextlink);
                self.queue.unshift(nextlink);
                inserted++;
            } else {
                // console.log('skip: ' + nextlink);
            }
        });
        this.seen[url] = true;
        for (var i=0; i<inserted; i++) {
            this.run();
        }
    }
};

var crawler = new Crawler();
crawler.run();

process.on('exit', function () {
    console.log(crawler.queue.length);
});

