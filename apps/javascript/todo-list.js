// title: To-do list with due dates
// level: beginner
// about: Add, complete and sort tasks — the data model behind every to-do app, without the interface.
// tags: objects, array methods, dates

class TodoList {
  #items = [];
  #nextId = 1;

  add(text, dueInDays, priority = 'normal') {
    const due = new Date(2026, 0, 1);
    due.setDate(due.getDate() + dueInDays);
    this.#items.push({ id: this.#nextId++, text, due, priority, done: false });
    return this;
  }

  complete(id) {
    const item = this.#items.find((t) => t.id === id);
    if (item) item.done = true;
    return this;
  }

  get pending() {
    const order = { high: 0, normal: 1, low: 2 };
    return this.#items
      .filter((t) => !t.done)
      .sort((a, b) => a.due - b.due || order[a.priority] - order[b.priority]);
  }

  get summary() {
    const done = this.#items.filter((t) => t.done).length;
    return `${done} of ${this.#items.length} done`;
  }
}

const list = new TodoList()
  .add('Submit the RAIT paper', 12, 'high')
  .add('Read the ColPali paper', 3, 'high')
  .add('Water the plants', 1, 'low')
  .add('Reply to the reviewer', 5)
  .complete(3);

const fmt = (d) => d.toISOString().slice(0, 10);

console.log('PENDING');
for (const t of list.pending) {
  console.log(`  [${t.priority.padEnd(6)}] ${fmt(t.due)}  ${t.text}`);
}
console.log('\n' + list.summary);
