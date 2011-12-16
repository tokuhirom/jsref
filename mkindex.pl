#!/usr/bin/perl
use strict;
use warnings;
use utf8;
use 5.010000;
use autodie;
use File::Zglob;
use Path::Class;

for my $fname (zglob('developer.mozilla.org/**/*')) {
    next if -d $fname;
    next if $fname =~ m{/robots.txt};
    my $title = $fname;
    $title =~ s!developer.mozilla.org/en/JavaScript/Reference/!!;
    say "$title:$fname";
}
