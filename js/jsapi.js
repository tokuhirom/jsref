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
            ul.empty();
            lines.forEach(function (line) {
                var title = line.split(':')[0];
                var path = line.split(':')[1];

                var li = $(document.createElement('li'));
                var a = $(document.createElement('a'));
                var x = title.match(/^Global_Objects\/(.+)$/);
                if (x) {
                    title = x[1].split('/').join('.');
                }
                a.html(title);
                li.click(function () {
                    view.iframe.hide();
                    view.mainLoading.show();
                    $.ajax({
                        url: path,
                        cache: false,
                        dataType: 'html'
                    }).done(function (dat) {
                        view.mainLoading.hide();
                        view.iframe.html(dat);
                        view.iframe.show();
                    });
                    return false;
                });
                li.append(a);
                ul.append(li);
            });
        },
        filterData: function (keyword) {
            keyword = RegExp.quotemeta(keyword);
            keyword = new RegExp(keyword, 'i');
            return JSAPI.data.split(/\n/).filter(function (x) {
                return !!keyword.test(x);
            });
        },
        init: function () {
            var view = this;

            $(document.getElementById('keyword')).keydown(function () {
                var keyword = $(this).val();
                JSAPI.insertData(
                    JSAPI.filterData(keyword)
                );
                return true;
            });

            $.get('index.txt').success(function (dat) {
                view.sideLoading.remove();

                var ul = JSAPI.titleContainerElem;
                JSAPI.data = dat;
                JSAPI.insertData(JSAPI.data.split(/\n/));
                JSAPI.resizeElems();
            });

            $(window).resize(function () { JSAPI.resizeElems() });
        }
    };
    JSAPI.init();
    window.JSAPI = JSAPI;
});
