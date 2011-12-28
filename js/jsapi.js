$(function () {

    //  http://phpjs.org/functions/quotemeta:496
    RegExp.quotemeta = function (str) {
        return (str + '').replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
    };

    var JSAPI = {
        data: null,
        titleContainerElem: $(document.getElementById('title-container')),
        mainLoading: $('.loading'),
        sideLoading: $('.nowloading'),
        iframe: $('.content-body'),
        resizeElems: function () {
            this.iframe.height($(window).height());
            $('.side').css({height: $(window).height() });
        },
        insertData: function (lines) {
            var view = this;

            var ul = JSAPI.titleContainerElem;
            var ulMap = {};
            ul.empty();

            lines.forEach(function (line) {
                var title = line.title;
                var x = title.match(/^([^\/]+)\/(.+)$/);
                var category = line.category;
                if (category in ulMap) { return; }

                ulMap[category] = $(document.createElement('ul'));
                var div = $(document.createElement('div'));
                div.append($('<div>' + category.replace(/_/g, ' ') + '</div>'));
                div.append(ulMap[category]);
                ul.append(div);
            });

            lines.forEach(function (line) {
                var title = line.title;
                var path = line.path;
                var category = line.category;
                console.log(line);
                var li = $(document.createElement('li'));
                var a = $(document.createElement('a'));

                if (line.esversion) {
                    a.append($('<span class="es indicator" />').text('ES' + line.esversion).addClass('es' + line.esversion));
                }
                if (line.deprecated) {
                    a.append($('<span class="deprecated indicator" />').text('deprecated'));
                }
                if (line.nonstandard) {
                    a.append($('<span class="nonstandard indicator" />').text('nonstandard'));
                }

                a.prepend(title);
                a.data('path', path);
                a.data('url', line.url);
                var url = line.url;
                    console.log(line);
                li.click(function () {
                    view.loadContent(url);
                    return false;
                });
                li.append(a);
                console.log(category);
                ulMap[category].append(li);
            });
        },
        filterData: function (keyword) {
            keyword = RegExp.quotemeta(keyword);
            keyword = new RegExp(keyword, 'i');
            return JSAPI.data.filter(function (x) {
                return !!keyword.test(x.title);
            });
        },
        loadContent: function (url) {
            console.log('load ' + url);
            var view = this;
            // view.iframe.hide(path);
            view.mainLoading.show();
            $.ajax({
                url: url,
                cache: false,
                dataType: 'html'
            }).done(function (dat) {
                dat = dat.replace(/<html[^>]+><body[^>]+>/, '').replace('</body></html>', '');
                view.currentPath = url;
                setTimeout(function () {
                    view.mainLoading.hide();
                    view.iframe.html(dat);
                    view.iframe.show();
                }, 0);
            });
        },
        init: function () {
            var view = this;

            $(document.getElementById('keyword')).keydown(function (e) {
                var keyword = $(this).val();
                if (e.keyCode === 13) { // enter key
                    var elem = JSAPI.titleContainerElem.find('ul li:first a');
                    if (elem) {
                        view.loadContent(elem.data('url'));
                    }
                    return false;
                } else {
                    JSAPI.insertData(
                        JSAPI.filterData(keyword)
                    );
                    return true;
                }
            });

            $.ajax({url: 'index.json', cache: false}).success(function (dat) {
                view.sideLoading.remove();

                var ul = JSAPI.titleContainerElem;
                JSAPI.data = dat;
                JSAPI.insertData(JSAPI.data);
                JSAPI.resizeElems();
            });

            $(window).resize(function () { JSAPI.resizeElems() });
        }
    };
    $('.content-body a').live('click', function (e) {
        var href = $(e.target).attr('href');
        if (href.match(/^https?:\/\//)) {
            // nop on absolute uri
            return true;
        } else {
            e.stopPropagation();
            e.preventDefault();
            console.log(href);

            if (!JSAPI.currentPath) {
                console.log("not loaded");
                return false;
            }
            var base = JSAPI.currentPath.replace(/\/[^/]+$/, '/');
            JSAPI.loadContent(base + href);

            return false;
        }
    });
    JSAPI.init();
    window.JSAPI = JSAPI;
});
