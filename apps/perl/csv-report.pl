# title: CSV report builder
# level: intermediate
# about: Reads a CSV, cleans the rows, groups them and prints a report — the job Perl was built for.
# tags: regex, hashes, text processing

use strict;
use warnings;

my $csv = <<'DATA';
date,region,rep,units,unit_price
2026-07-02,North,Asha,12,499.00
2026-07-04,South,Rahul,7,499.00
2026-07-09,North,Meera,20,449.00
2026-07-15,East,Asha,5,599.00
2026-07-19,South,Rahul,14,449.00
2026-07-23,North,Asha,9,599.00
2026-07-28,East,Meera,11,499.00
DATA

my @lines = split /\n/, $csv;
my $header = shift @lines;
my @cols = split /,/, $header;

my (%by_region, %by_rep, $revenue, $units);

for my $line (@lines) {
    next unless $line =~ /\S/;
    my %row;
    @row{@cols} = split /,/, $line;
    my $amount = $row{units} * $row{unit_price};

    $by_region{ $row{region} } += $amount;
    $by_rep{ $row{rep} }{revenue} += $amount;
    $by_rep{ $row{rep} }{orders}  += 1;
    $revenue += $amount;
    $units   += $row{units};
}

printf "Orders    : %d\n", scalar @lines;
printf "Units     : %d\n", $units;
printf "Revenue   : %.2f\n", $revenue;
printf "Avg order : %.2f\n\n", $revenue / scalar @lines;

print "BY REGION\n";
for my $region (sort { $by_region{$b} <=> $by_region{$a} } keys %by_region) {
    printf "  %-6s %10.2f  %5.1f%%  %s\n",
        $region, $by_region{$region},
        $by_region{$region} / $revenue * 100,
        '#' x int($by_region{$region} / $revenue * 40);
}

print "\nBY REPRESENTATIVE\n";
for my $rep (sort { $by_rep{$b}{revenue} <=> $by_rep{$a}{revenue} } keys %by_rep) {
    printf "  %-6s %10.2f over %d orders (avg %.2f)\n",
        $rep, $by_rep{$rep}{revenue}, $by_rep{$rep}{orders},
        $by_rep{$rep}{revenue} / $by_rep{$rep}{orders};
}
