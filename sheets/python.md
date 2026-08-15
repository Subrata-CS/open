---
title: Python
group: Languages
about: The parts of the standard library that remove the most code.
tags: python, comprehensions, collections, idioms
---

## Comprehensions

```python
squares  = [n * n for n in nums if n % 2 == 0]
lookup   = {word: len(word) for word in words}
unique   = {word.lower() for word in words}
lazy     = (n * n for n in range(1_000_000))   # generator, nothing computed yet
```

Reach for a comprehension when you are building a collection. Reach for a
normal loop when you are doing something — a comprehension written for its
side effects is a loop in disguise.

## Unpacking

```python
first, *middle, last = [10, 20, 30, 40, 50]
a, b = b, a                      # swap, no temporary
config = {**defaults, **overrides}
print(*items, sep=", ")
```

## The collections worth knowing

| Import | Use it for |
|---|---|
| `from collections import Counter` | counting things: `Counter(words).most_common(3)` |
| `from collections import defaultdict` | grouping without checking keys first |
| `from collections import deque` | a fast queue: `popleft()` is O(1), `list.pop(0)` is not |
| `from itertools import groupby, chain` | flattening and grouping sorted data |
| `from functools import lru_cache` | memoising a slow pure function |

## Files and context managers

```python
with open("data.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
```

The `with` block closes the file even if the code inside raises. Write your own
with `@contextmanager` — anything that must be undone belongs in one.

## Formatting

```python
name, score = "Asha", 91.456
print(f"{name:<10} {score:>8.2f}")      # left, right, two decimals
print(f"{1234567:,}")                   # 1,234,567
print(f"{0.8734:.1%}")                  # 87.3%
print(f"{score=}")                      # score=91.456  — for debugging
```

## Things that catch people

```python
def add(item, bucket=[]):    # WRONG: the list is created once, and shared
    bucket.append(item)
    return bucket

def add(item, bucket=None):  # right
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket
```

`is` compares identity, `==` compares value. Use `is` only for `None`, `True`
and `False`.
