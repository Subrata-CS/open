---
title: Regular expressions
group: Languages
about: The syntax, the traps, and patterns you can copy straight out.
tags: regex, patterns, matching, text
---

## Characters

| Pattern | Matches |
|---|---|
| `.` | any character except a newline |
| `\d` `\D` | a digit / not a digit |
| `\w` `\W` | word character `[A-Za-z0-9_]` / not |
| `\s` `\S` | whitespace / not |
| `[abc]` | any one of a, b, c |
| `[^abc]` | any character except those |
| `[a-z0-9]` | a range |

## How many

| Pattern | Meaning |
|---|---|
| `*` | zero or more |
| `+` | one or more |
| `?` | zero or one |
| `{3}` | exactly three |
| `{2,}` | two or more |
| `{2,5}` | between two and five |
| `+?` `*?` | the lazy versions — as few as possible |

Greedy versus lazy is the most common bug. `<.*>` on `<a><b>` matches the whole
string; `<.*?>` matches just `<a>`.

## Anchors and groups

| Pattern | Meaning |
|---|---|
| `^` `$` | start / end of the string (or line, with the `m` flag) |
| `\b` | a word boundary |
| `(abc)` | a capturing group |
| `(?:abc)` | a group that does not capture |
| `(?<year>\d{4})` | a named group |
| `a\|b` | a or b |
| `(?=abc)` | followed by (lookahead) |
| `(?<=abc)` | preceded by (lookbehind) |

## Flags

| Flag | Effect |
|---|---|
| `g` | find every match, not just the first |
| `i` | ignore case |
| `m` | `^` and `$` match at each line |
| `s` | `.` also matches newlines |

## Patterns worth keeping

```text
^\S+@\S+\.\S+$                       a workable email check
^\+?[0-9]{10,13}$                    a phone number
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$  password with mixed case and a digit
\b\d{4}-\d{2}-\d{2}\b                an ISO date
^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})  a URL, loosely
```

:::caution
Do not validate email addresses strictly with a regex — the real specification
is far more permissive than anyone expects, and a strict pattern rejects valid
addresses. Check for one `@`, then send a confirmation message.
:::

## Catastrophic backtracking

```text
(a+)+$          against "aaaaaaaaaaaaaaaaaaaaX"
```

Nested quantifiers make the engine try exponentially many splits before giving
up. If a pattern is ever slow on a long string, look for a quantifier inside a
quantifier first.
