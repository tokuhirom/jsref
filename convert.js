"use strict";
/**
 * Convert doc.db to converted/ data.
 **/

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    libxml = require('libxmlext'),
    DB = require('./lib/DB').DB,
    Url = require('url'),
    mkdirp = require('mkdirp'),
    querystring = require('querystring'),
    crypto = require('crypto'),
    undefined
    ;

var srcdb = new DB('docs.db');

mkdirp.sync('converted', parseInt('744', 8));

srcdb.listUrls().forEach(function (url) {
    var src = srcdb.fetch(url);
    var doc = libxml.parseHtmlString(src);
    // q.find('script, header, #nav-toolbar, .page-watch, footer, #sessionMsg, head, #pageToc, #article-nav, #page-buttons').remove();
    doc.search('script, header, #nav-toolbar, .page-watch, footer, #sessionMsg, head, #pageToc, #article-nav, #page-buttons').forEach(function (e) {
        e.remove();
    });

    var path = Url.parse(url).pathname;

    var title = path.replace(/^\/en\/JavaScript\/Reference\//, '').replace(/^[^/]+\//, '').replace(/\//g, '.').replace(/_/g, ' ');
    if (path == '/en/JavaScript/Reference') {
        title = 'Top page';
    }
    doc.find('//*[@id="title"]').forEach(function (e) { e.text(title) });
    var md5 = crypto.createHash('md5');
    md5.update(path);
    var ofname = 'converted/' + md5.digest('hex');
    console.log('writing ' + ofname);
    fs.writeFileSync(ofname, doc.toString());
});

