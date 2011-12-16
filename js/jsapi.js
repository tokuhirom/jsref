$(function () {
    var iframe = $('.content-body');
    var loading = $('.loading');
    function resizeElems() {
        iframe.height($(window).height());
        $('.side').css({height: $(window).height() });
    }
    $.get('index.txt').success(function (dat) {
        $('.nowloading').remove();
        var ul = $(document.createElement('ul'));
        dat.split(/\n/).forEach(function (line) {
            var title = line.split(':')[0];
            var path = line.split(':')[1];

            var li = $(document.createElement('li'));
            var a = $(document.createElement('a'));
            a.html(title.replace('Global_Objects/', ''));
            a.click(function () {
                iframe.hide();
                loading.show();
                $.ajax({
                    url: path,
                    cache: false,
                    dataType: 'html'
                }).done(function (dat) {
                    loading.hide();
                    iframe.html(dat);
                    iframe.show();
                });
                return false;
            });
            li.append(a);
            ul.append(li);
        });
        $('.side').append(ul);
        resizeElems();
    });
    $(window).resize(function () { resizeElems() });
});
