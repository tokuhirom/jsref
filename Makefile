all: download index.txt

httpd:
	@echo "Access to http://localhost:9041/index.html"
	node server.js

clean:
	rm -rf developer.mozilla.org

index.json:
	node mkindex.js > index.json

download:
	wget -np --mirror -k -c -r -I /en/JavaScript/Reference/  https://developer.mozilla.org/en/JavaScript/Reference

deps:
	npm install

.PHONY: download all clean
