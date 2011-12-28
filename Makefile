all: mkdat index.txt

httpd:
	@echo "Access to http://localhost:9041/index.html"
	node server.js

mkdat:
	node crawler.js
	node convert.js
	node mkindex.js > index.json

clean:
	rm -rf converted/ docs.db index.json

deps:
	npm install

.PHONY: download all clean
