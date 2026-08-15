// title: Task scheduler with dependencies
// level: advanced
// about: Works out what order tasks must run in, and catches circular dependencies — a topological sort doing real work.
// tags: generics, graphs, types

type TaskId = string;

interface Task {
  id: TaskId;
  name: string;
  minutes: number;
  needs: TaskId[];
}

const tasks: Task[] = [
  { id: 'design',  name: 'Design the schema',   minutes: 90,  needs: [] },
  { id: 'migrate', name: 'Write migrations',    minutes: 45,  needs: ['design'] },
  { id: 'api',     name: 'Build the API',       minutes: 120, needs: ['migrate'] },
  { id: 'ui',      name: 'Build the interface', minutes: 150, needs: ['design'] },
  { id: 'tests',   name: 'Write the tests',     minutes: 75,  needs: ['api', 'ui'] },
  { id: 'deploy',  name: 'Deploy',              minutes: 20,  needs: ['tests'] },
];

type Order = { ok: true; order: Task[] } | { ok: false; cycle: TaskId[] };

function schedule(all: Task[]): Order {
  const byId = new Map(all.map((t) => [t.id, t]));
  const state = new Map<TaskId, 'new' | 'open' | 'done'>();
  const order: Task[] = [];
  const stack: TaskId[] = [];

  const visit = (id: TaskId): TaskId[] | null => {
    if (state.get(id) === 'done') return null;
    if (state.get(id) === 'open') return [...stack.slice(stack.indexOf(id)), id];

    state.set(id, 'open');
    stack.push(id);
    for (const need of byId.get(id)?.needs ?? []) {
      const cycle = visit(need);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, 'done');
    order.push(byId.get(id)!);
    return null;
  };

  for (const t of all) {
    const cycle = visit(t.id);
    if (cycle) return { ok: false, cycle };
  }
  return { ok: true, order };
}

const result = schedule(tasks);

if (result.ok) {
  let clock = 0;
  console.log('RUN ORDER');
  for (const t of result.order) {
    const start = clock;
    clock += t.minutes;
    console.log(`  ${String(start).padStart(4)}m  ${t.name} (${t.minutes}m)`);
  }
  console.log(`\nSequential total: ${clock} minutes (${(clock / 60).toFixed(1)} hours)`);
}

// now break it on purpose
const broken: Task[] = [
  { id: 'a', name: 'A', minutes: 10, needs: ['c'] },
  { id: 'b', name: 'B', minutes: 10, needs: ['a'] },
  { id: 'c', name: 'C', minutes: 10, needs: ['b'] },
];
const bad = schedule(broken);
console.log('\nCircular check:', bad.ok ? 'fine' : `cycle found -> ${bad.cycle.join(' -> ')}`);
