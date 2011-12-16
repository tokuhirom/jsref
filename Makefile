all: download index.txt

httpd:
	@echo "Access to http://localhost:9041/index.html"
	plackup -p 9041 -e 'use Plack::App::Directory; Plack::App::Directory->new()->to_app()'

clean:
	rm -rf developer.mozilla.org

index.txt:
	perl mkindex.pl

download:
	wget -np --mirror -k -c -r -I /en/JavaScript/Reference/  https://developer.mozilla.org/en/JavaScript/Reference

.PHONY: download all clean
