use strict;
use Plack::Builder;
use Plack::App::Directory;
use Plack::Request;
use Plack::Util;
use Data::Dumper;
use Plack::Response;
use Web::Query;
use Encode;

my $app = Plack::App::Directory->new();
builder {
    enable 'ContentLength';

    sub {
        my $req = Plack::Request->new(shift);
        if ($req->path_info eq '/') {
            open my $fh, '<', 'index.html';
            return [200, [], $fh];
        } elsif ($req->path_info =~ m{^/developer.mozilla.org/}) {
            my $res = $app->($req->env);
            return $res if $res->[0] ne 200;

            my $q = wq('file://' . $res->[2]->path);
            {
                my $title = $req->path_info;
                $title =~ s{^/developer.mozilla.org/en/JavaScript/Reference/}{};
                $title =~ s{^[^/]+/}{};
                $title =~ s!/!.!g;
                $title =~ s!_! !g;
                $q->find('#title')->text($title);
            }
            $q->find('script')->remove();
            $q->find('header')->remove();
            $q->find('#nav-toolbar')->remove();
            $q->find('.page-watch')->remove();
            $q->find('footer')->remove();
            $q->find('#sessionMsg')->remove();
            $q->find('head')->remove();
            $q->find('#pageToc')->remove();
            $q->find('#article-nav')->remove();
            $q->find('#page-buttons')->remove();
            $q->html();
            $res = Plack::Response->new(@$res);
            $res->content_type('text/html; charset=utf8');
            $res->body(encode_utf8($q->html()));
            $res->content_length(length $res->body);
            return $res->finalize;
        } else {
            $app->($req->env);
        }
    };
};
