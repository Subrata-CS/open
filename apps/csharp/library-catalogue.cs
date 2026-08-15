// title: Library catalogue with LINQ
// level: intermediate
// about: Search, filter and group a catalogue — the query patterns behind every admin dashboard.
// tags: linq, classes, grouping

using System;
using System.Linq;
using System.Collections.Generic;

class Book {
    public string Title { get; set; }
    public string Author { get; set; }
    public int Year { get; set; }
    public string Genre { get; set; }
    public double Rating { get; set; }

    public Book(string title, string author, int year, string genre, double rating) {
        Title = title; Author = author; Year = year; Genre = genre; Rating = rating;
    }
}

class Program {
    static void Main() {
        var books = new List<Book> {
            new Book("Introduction to Algorithms", "Cormen",     2009, "CS", 4.7),
            new Book("Clean Code",                 "Martin",     2008, "CS", 4.4),
            new Book("Deep Learning",              "Goodfellow", 2016, "AI", 4.6),
            new Book("The Pragmatic Programmer",   "Hunt",       1999, "CS", 4.5),
            new Book("Pattern Recognition",        "Bishop",     2006, "AI", 4.3),
            new Book("Refactoring",                "Fowler",     2018, "CS", 4.2),
        };

        Console.WriteLine("HIGHLY RATED, THIS CENTURY");
        foreach (var b in books.Where(b => b.Rating >= 4.4 && b.Year >= 2000)
                               .OrderByDescending(b => b.Rating))
            Console.WriteLine(string.Format("  {0:F1}  {1} - {2} ({3})", b.Rating, b.Title, b.Author, b.Year));

        Console.WriteLine();
        Console.WriteLine("BY GENRE");
        foreach (var g in books.GroupBy(b => b.Genre).OrderBy(g => g.Key))
            Console.WriteLine(string.Format("  {0,-4} {1} books, average {2:F2}",
                                            g.Key, g.Count(), g.Average(b => b.Rating)));

        Console.WriteLine();
        Console.WriteLine("SEARCH 'pro'");
        var hits = books.Where(b => b.Title.ToLower().Contains("pro")
                                 || b.Author.ToLower().Contains("pro"));
        foreach (var b in hits) Console.WriteLine("  " + b.Title);

        var oldest = books.OrderBy(b => b.Year).First();
        Console.WriteLine();
        Console.WriteLine(string.Format("Oldest on the shelf: {0} ({1})", oldest.Title, oldest.Year));

        var span = books.Max(b => b.Year) - books.Min(b => b.Year);
        Console.WriteLine(string.Format("Catalogue spans {0} years, {1} titles.", span, books.Count));
    }
}
