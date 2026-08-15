---
title: SQL
group: Data
about: From SELECT to window functions, in the order you actually need them.
tags: sql, joins, aggregates, indexes
---

## Reading rows

```sql
SELECT name, marks
FROM student
WHERE marks >= 80
ORDER BY marks DESC
LIMIT 10;
```

Order of evaluation is not the order you write it: `FROM` → `WHERE` →
`GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. That single fact
explains most SQL confusion — you cannot use a `SELECT` alias in `WHERE`,
because `WHERE` ran first.

## Joins

| Join | Keeps |
|---|---|
| `INNER JOIN` | rows that match on both sides |
| `LEFT JOIN` | every row on the left, `NULL` where the right has none |
| `RIGHT JOIN` | the mirror of a left join |
| `FULL OUTER JOIN` | everything from both sides |
| `CROSS JOIN` | every combination — usually a mistake |

```sql
SELECT s.name, sc.subject, sc.marks
FROM student s
JOIN score sc ON sc.student_id = s.id;
```

## Grouping

```sql
SELECT branch,
       COUNT(*)            AS students,
       ROUND(AVG(marks),1) AS average
FROM student
GROUP BY branch
HAVING COUNT(*) > 1;
```

`WHERE` filters rows before grouping. `HAVING` filters groups after. Using
`WHERE` on an aggregate is the most common beginner error.

## Window functions

Where `GROUP BY` collapses rows, a window function keeps them:

```sql
SELECT name,
       marks,
       RANK()       OVER (ORDER BY marks DESC)          AS overall,
       RANK()       OVER (PARTITION BY branch
                          ORDER BY marks DESC)          AS in_branch,
       AVG(marks)   OVER (PARTITION BY branch)          AS branch_average
FROM student;
```

## Indexes

```sql
CREATE INDEX idx_student_branch ON student(branch);
EXPLAIN QUERY PLAN SELECT * FROM student WHERE branch = 'CSE';
```

An index makes reads fast and writes slightly slower. Index the columns you
filter and join on — not every column, and rarely a column with only a few
distinct values.
