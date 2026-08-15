# title: Quiz application with scoring
# level: beginner
# about: Questions, answers, scoring and a grade — the engine behind every online test.
# tags: blocks, hashes, scoring

QUESTIONS = [
  { q: "Which data structure works first in, first out?",
    options: %w[Stack Queue Tree Graph], answer: 1 },
  { q: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], answer: 2 },
  { q: "Which keyword makes a variable constant in C?",
    options: %w[final static const immutable], answer: 2 },
  { q: "SQL: which clause filters groups?",
    options: %w[WHERE HAVING FILTER GROUP], answer: 1 },
]

# What the candidate picked, in order
SUBMITTED = [1, 2, 0, 1]

score = 0
QUESTIONS.each_with_index do |item, i|
  chosen = SUBMITTED[i]
  right = chosen == item[:answer]
  score += 1 if right

  puts "Q#{i + 1}. #{item[:q]}"
  item[:options].each_with_index do |opt, j|
    mark = if j == item[:answer] then "correct"
           elsif j == chosen     then "your answer"
           else "" end
    puts format("    %s %-12s %s", ("abcd"[j] + ")"), opt, mark)
  end
  puts "    -> #{right ? 'right' : 'wrong'}\n\n"
end

percent = score * 100.0 / QUESTIONS.size
grade = case percent
        when 90.. then "A"
        when 75...90 then "B"
        when 50...75 then "C"
        else "F"
        end

puts "Score: #{score}/#{QUESTIONS.size}  (#{percent.round(1)}%)  grade #{grade}"
puts percent >= 50 ? "Passed." : "Needs another attempt."
