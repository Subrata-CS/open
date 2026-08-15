---
title: Big-O and complexity
group: Theory
about: What each growth rate costs, and which operation on each data structure gives it to you.
tags: big-o, complexity, algorithms, data structures
---

## Growth rates, in order

| Notation | Name | 1,000 items feels like | Example |
|---|---|---|---|
| `O(1)` | constant | instant | hash lookup, array index |
| `O(log n)` | logarithmic | instant | binary search, balanced tree |
| `O(n)` | linear | instant | one pass over a list |
| `O(n log n)` | linearithmic | fast | merge sort, heap sort |
| `O(n²)` | quadratic | noticeable | nested loop, bubble sort |
| `O(2ⁿ)` | exponential | impossible | naive subsets, naive Fibonacci |
| `O(n!)` | factorial | impossible | every permutation |

The gap that matters most in practice is `O(n log n)` to `O(n²)`. At a million
items that is roughly twenty million operations against a million million.

## Data structures

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | `O(1)` | `O(n)` | `O(n)` | `O(n)` |
| Sorted array | `O(1)` | `O(log n)` | `O(n)` | `O(n)` |
| Linked list | `O(n)` | `O(n)` | `O(1)` | `O(1)` |
| Hash table | — | `O(1)` avg | `O(1)` avg | `O(1)` avg |
| Balanced BST | `O(log n)` | `O(log n)` | `O(log n)` | `O(log n)` |
| Heap | `O(1)` peek | `O(n)` | `O(log n)` | `O(log n)` |

Hash table times are averages. A bad hash function, or an adversary choosing
keys, degrades them to `O(n)`.

## Sorting

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | yes |
| Insertion | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | yes |
| Merge | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes |
| Quick | `O(n log n)` | `O(n log n)` | `O(n²)` | `O(log n)` | no |
| Heap | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | no |
| Counting | `O(n+k)` | `O(n+k)` | `O(n+k)` | `O(k)` | yes |

Quicksort is usually fastest in practice despite the worse bound, because its
constant factor is small and it works in place.

## Reading a bound

- Constants are dropped: `O(3n)` is `O(n)`.
- Lower terms are dropped: `O(n² + n)` is `O(n²)`.
- Nested loops multiply; sequential loops add.
- `O` is the ceiling, `Ω` the floor, `Θ` both at once.

## Amortised cost

Appending to a dynamic array is `O(1)` *amortised*: most appends are instant,
and occasionally one copies everything to a larger block. Spread across many
appends the average stays constant — which is why "worst case" and "what it
costs in practice" are different questions.
