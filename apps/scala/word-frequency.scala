// title: Word frequency and readability
// level: intermediate
// about: Counts words, finds the vocabulary, and scores how hard a passage is to read.
// tags: collections, functional, text

object Main extends App {
  val text =
    """A cache stores recently used data so it can be read again quickly.
      |Cache memory sits between the processor and main memory.
      |Because it is small and fast, the cache holds only what is likely to be needed next.
      |When the processor asks for data that is not in the cache, that is a cache miss.""".stripMargin

  val words = text.toLowerCase.split("[^a-z]+").filter(_.nonEmpty).toList
  val sentences = text.split("[.!?]").count(_.trim.nonEmpty)

  val counts = words.groupBy(identity).view.mapValues(_.size).toList.sortBy { case (w, n) => (-n, w) }

  println("MOST FREQUENT")
  counts.take(6).foreach { case (w, n) =>
    println(f"  $w%-12s $n%2d  ${"#" * n}")
  }

  val vocabulary = counts.size
  val avgLen = words.map(_.length).sum.toDouble / words.size
  val perSentence = words.size.toDouble / sentences
  val longWords = words.count(_.length > 6)

  println(f"%nwords         ${words.size}%d")
  println(f"unique words  $vocabulary%d  (${vocabulary * 100.0 / words.size}%.1f%% variety)")
  println(f"sentences     $sentences%d")
  println(f"avg word      $avgLen%.2f letters")
  println(f"avg sentence  $perSentence%.1f words")

  // A rough readability index: longer words and longer sentences are harder.
  val score = 0.39 * perSentence + 11.8 * (longWords.toDouble / words.size) - 15.59
  val level = if (score < 6) "easy" else if (score < 10) "moderate" else "demanding"
  println(f"%nreadability   $score%.1f — $level")
}
