var fs = require('fs'),
    util = require('util'),
    undefined;

util.puts([
"<!DOCTYPE html>",
"<html lang='en'><head><meta http-equiv='content-type' content='text/html; charset=UTF-8' /></head><body>",
"<div id='search'><input type='search' placeholder='Search' autosave='searchdoc' results='10' id='search-field' autocomplete='off' /></div>",
"<ul id='static-list'>"
].join("\n"));

var categories = [
    'Global Objects',
    'Functions and function scope',
    'Statements',
    'Operators',
    'Misc'
];
var dat = JSON.parse(fs.readFileSync('htdocs/index.json'));
var categoryItems = {};
dat.forEach(function (x) {
    if (!categoryItems[x.category]) {
        categoryItems[x.category] = [];
    }
    categoryItems[x.category].push(x);
});
categories.forEach(function (category) {
    var ret = [];
    ret.push('<li class="category"><span>' + category + '</span><ul>');
    categoryItems[category].forEach(function (line) {
        ret.push('<li class="sub"><a href="' + line.url + '"><span class="searchable">' + line.title + '</span></a></li>');
    });
    ret.push('</ul></li>');
    util.puts(ret.join("\n"));
});

util.puts([
"</ul></body></html>",
].join("\n"));
