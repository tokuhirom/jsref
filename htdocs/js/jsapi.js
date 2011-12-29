$(function () {
    var JSAPI = {
        data: null,
        init: function () {
            $.ajax({
                url: 'index.json',
                dataType: 'json',
                cache: false
            }).success(function (dat) {
                JSAPI.data = dat;
            });
        }
    };
    $('#content a').live('click', function (e) {
        var elem = $(e.currentTarget);
        var href = elem.attr('href');
        if (href && href.match(/^https?:\/\/developer.mozilla.org\/en\/JavaScript\/Reference\//)) {
            if (!JSAPI.data) {
                // console.log("not loaded");
                return false;
            }
            var d = JSAPI.data;
            href = href.replace(/^https:\/\/developer.mozilla.org/, '');
            for (var i=0, l=d.length; i<l; i++) {
                if (href === d[i].path) {
                    location.hash = 'p=' + d[i].url;
                    return false;
                }
            }

            return true;
        } else {
            // nop on absolute uri
            return true;
        }
    });
    JSAPI.init();
    window.JSAPI = JSAPI;
});
