all: download index.txt

httpd:
	@echo "Access to http://localhost:9041/index.html"
	plackup -p 9041 app.psgi

clean:
	rm -rf developer.mozilla.org

index.json:
	node mkindex.js > index.json

download:
	wget -np --mirror -k -c -r -I /en/JavaScript/Reference/  https://developer.mozilla.org/en/JavaScript/Reference

.PHONY: download all clean
