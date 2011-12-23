var fs = require('fs'),
    glob = require('glob'),
    nquery = require('nquery'),
    util = require('util'),
    path = require('path'),
    mkdirp = require('mkdirp')
    libxml = require('libxmljs'),
    undefined
    ;

glob.globSync('developer.mozilla.org/**/*', glob.GLOB_STAR).filter(function (path) {
    return !fs.statSync(path).isDirectory();
}).forEach(function (fname) {
    var src = fs.readFileSync(fname, 'utf-8');
    var doc = libxml.parseHtmlString(src);
    ['//script', '//head', '//noscript', '//header', '//*[@id="nav-toolbar"]', '//*[contains(concat(" ",normalize-space(@class)," "), " page-watch ")]', '//footer', '//*[@id="sessionMsg"]', '//*[@id="pageToc"]', '//*[@id="article-nav"]', '//*[@id="page-buttons"]'].forEach(function (xpath) {
        doc.find(xpath).forEach(function (e) {
            e.remove();
        });
    });

    // q.find('script, header, #nav-toolbar, .page-watch, footer, #sessionMsg, head, #pageToc, #article-nav, #page-buttons').remove();

    var title = fname.replace(/^developer.mozilla.org\/en\/JavaScript\/Reference\//, '').replace(/^[^/]+\//, '').replace(/\//g, '.').replace(/_/g, / /);
    doc.find('//*[@id="title"]').forEach(function (e) { e.text(title) });
    var ofname = fname.replace(/^developer.mozilla.org/, 'converted');
    mkdirp.sync(path.dirname(ofname), 0775);
    fs.writeFileSync(ofname, doc.toString());
});

