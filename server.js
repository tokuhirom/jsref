var express = require('express'),
    util = require('util'),
    app = express.createServer(
        express.logger()
    );

app.use(express.static(__dirname + '/htdocs/'));

app.listen(9041);
util.log('jsapi server is listening port 9041. open http://localhost:9041/');
