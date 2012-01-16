all: mkdat

httpd:
	@echo "Access to http://localhost:9041/index.html"
	node server.js

mkdat:
	node crawler.js
	node convert.js
	node mkindex.js > htdocs/index.json

watch-less:
	watcher --dir less -- sh -c 'lessc less/styles.less  > htdocs/css/jsapi.css'

clean:
	rm -rf htdocs/converted/ docs.db htdocs/index.json

deps:
	npm install

.PHONY: download all clean
