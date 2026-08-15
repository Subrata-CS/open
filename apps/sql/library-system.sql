-- title: Library lending system
-- level: intermediate
-- about: Books, members and loans in one schema, then the query every librarian actually wants — who is overdue.
-- tags: joins, dates, aggregates

CREATE TABLE book   (id INTEGER PRIMARY KEY, title TEXT, author TEXT, copies INTEGER);
CREATE TABLE member (id INTEGER PRIMARY KEY, name TEXT, joined TEXT);
CREATE TABLE loan   (id INTEGER PRIMARY KEY, book_id INTEGER, member_id INTEGER,
                     taken TEXT, due TEXT, returned TEXT);

INSERT INTO book VALUES
 (1,'Introduction to Algorithms','Cormen',3),
 (2,'Clean Code','Martin',2),
 (3,'Deep Learning','Goodfellow',1),
 (4,'The C Programming Language','Kernighan',4);

INSERT INTO member VALUES
 (1,'Asha','2025-08-01'),(2,'Rahul','2025-11-14'),(3,'Meera','2026-01-09');

INSERT INTO loan VALUES
 (1,1,1,'2026-07-01','2026-07-15','2026-07-12'),
 (2,3,1,'2026-07-20','2026-08-03',NULL),
 (3,2,2,'2026-06-28','2026-07-12',NULL),
 (4,4,3,'2026-07-25','2026-08-08',NULL),
 (5,1,2,'2026-07-30','2026-08-13',NULL);

-- who still has a book, and how late are they on 2026-08-15?
SELECT m.name,
       b.title,
       l.due,
       CAST(julianday('2026-08-15') - julianday(l.due) AS INTEGER) AS days_late
FROM loan l
JOIN member m ON m.id = l.member_id
JOIN book   b ON b.id = l.book_id
WHERE l.returned IS NULL
ORDER BY days_late DESC;

-- how many copies of each title are actually on the shelf right now?
SELECT b.title,
       b.copies - COUNT(l.id) AS on_shelf
FROM book b
LEFT JOIN loan l ON l.book_id = b.id AND l.returned IS NULL
GROUP BY b.id
ORDER BY on_shelf, b.title;
