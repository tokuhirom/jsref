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
    /*
    doc.find('//script').forEach(function (e) { e.remove() });
    doc.find('//header').forEach(function (e) { e.remove() });
    doc.find('//*[id="nav-toolbar"]').forEach(function (e) { e.remove() });
    doc.find('//*[id="nav-toolbar"]').forEach(function (e) { e.remove() });
    */
    var q = nquery.createHtmlDocument(src);
    // q.find('script, header, #nav-toolbar, .page-watch, footer, #sessionMsg, head, #pageToc, #article-nav, #page-buttons').remove();

    var title = fname.replace(/^developer.mozilla.org\/en\/JavaScript\/Reference\//, '').replace(/^[^/]+/, '').replace(/\//, '.').replace(/_/, / /);
    doc.find('//*[@id="title"]').innerHTML = title;
    if (title.match(/arguments/)) {
        console.log(doc.toString());
        process.exit();
    }
    var ofname = fname.replace(/^developer.mozilla.org/, 'converted');
    mkdirp.sync(path.dirname(ofname), 0775);
    fs.writeFileSync(ofname, doc.toString());
});

