<?php
// title: Invoice generator
// level: intermediate
// about: Line items, tax, discount and a printed invoice — the calculation every billing system gets wrong at least once.
// tags: arrays, formatting, money

$invoice = [
    'number' => 'INV-2026-0042',
    'client' => 'Subrata Sikha Niketan',
    'date'   => '2026-08-15',
    'items'  => [
        ['desc' => 'Course design',      'qty' => 12, 'rate' => 1500.00],
        ['desc' => 'Video editing',      'qty' => 30, 'rate' =>  400.00],
        ['desc' => 'Hosting (one year)', 'qty' =>  1, 'rate' => 6000.00],
    ],
    'discountPct' => 10,
    'taxPct'      => 18,
];

function money(float $n): string { return number_format($n, 2); }

echo "INVOICE {$invoice['number']}\n";
echo "Billed to : {$invoice['client']}\n";
echo "Date      : {$invoice['date']}\n\n";

printf("%-22s %5s %12s %14s\n", 'DESCRIPTION', 'QTY', 'RATE', 'AMOUNT');
echo str_repeat('-', 56) . "\n";

$subtotal = 0.0;
foreach ($invoice['items'] as $item) {
    $amount = $item['qty'] * $item['rate'];
    $subtotal += $amount;
    printf("%-22s %5d %12s %14s\n", $item['desc'], $item['qty'], money($item['rate']), money($amount));
}

$discount = $subtotal * $invoice['discountPct'] / 100;
$taxable  = $subtotal - $discount;
$tax      = $taxable * $invoice['taxPct'] / 100;
$total    = $taxable + $tax;

echo str_repeat('-', 56) . "\n";
printf("%40s %14s\n", 'Subtotal', money($subtotal));
printf("%40s %14s\n", "Discount ({$invoice['discountPct']}%)", '-' . money($discount));
printf("%40s %14s\n", "GST ({$invoice['taxPct']}%)", money($tax));
printf("%40s %14s\n", 'TOTAL DUE', money($total));

$words = $total >= 100000 ? 'over one lakh' : 'under one lakh';
echo "\nAmount payable is {$words}. Payment due within 15 days.\n";
