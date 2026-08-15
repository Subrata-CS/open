# title: Monthly expense tracker
# level: beginner
# about: Groups a month of spending by category, works out the share of each, and flags where the budget went.
# tags: dictionaries, formatting, analysis

expenses = [
    ("rent",      12000), ("groceries", 4200), ("transport", 1800),
    ("internet",   800),  ("groceries", 2600), ("books",     1500),
    ("transport",  950),  ("eating out", 2300), ("groceries", 1900),
]
BUDGET = 30000

totals = {}
for category, amount in expenses:
    totals[category] = totals.get(category, 0) + amount

spent = sum(totals.values())
ranked = sorted(totals.items(), key=lambda kv: -kv[1])

print(f"{'CATEGORY':<12}{'AMOUNT':>9}{'SHARE':>8}  BAR")
print("-" * 46)
for category, amount in ranked:
    share = amount / spent * 100
    print(f"{category:<12}{amount:>9,}{share:>7.1f}%  {'#' * int(share / 3)}")

print("-" * 46)
print(f"{'TOTAL':<12}{spent:>9,}")
print(f"{'BUDGET':<12}{BUDGET:>9,}")

left = BUDGET - spent
if left >= 0:
    print(f"\nUnder budget by {left:,} — {left / BUDGET * 100:.1f}% still unspent.")
else:
    print(f"\nOver budget by {-left:,}. Biggest line: {ranked[0][0]} at {ranked[0][1]:,}.")
