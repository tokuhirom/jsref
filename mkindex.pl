#!/usr/bin/perl
use strict;
use warnings;
use utf8;
use 5.010000;
use autodie;
use File::Zglob;
use Path::Class;
use JSON;
use Web::Query;

my @ret;
for my $fname (zglob('developer.mozilla.org/**/*')) {
    next if -d $fname;
    next if $fname =~ m{/robots.txt};
    my $category = do {
        my $path = $fname;
        $path =~ s!developer.mozilla.org/en/JavaScript/Reference/!!;
        if (my ($category) = ($path =~ m{^([^/]+)/})) {
            $category;
        } else {
            'Misc';
        }
    };
    # my $q = wq('file://' . Cwd::abs_path($fname));
    # my $title = $q->find('title')->text();
    # $title =~ s/ - MDN//;
    my $title = do {
        my $p = $fname;
        $p =~ s!developer.mozilla.org/en/JavaScript/Reference/!!;
        $p =~ s{^([^/]+)/}{};
        $p =~ s/_/ /g;
        $p =~ s!/!.!g;
        $p;
    };
    push @ret, +{
        title => $title,
        path  => $fname,
        category => $category,
    };
}
print encode_json(\@ret);

