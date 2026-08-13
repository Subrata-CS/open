import { useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import CodeLab, { type LessonCell } from '@site/src/components/CodeLab';
import type { LangId } from '@site/src/lib/runners';
import styles from './playground.module.css';

type Topic = {
  id: string;
  label: string;
  lang: LangId;
  lesson: LessonCell[];
};

const TOPICS: Topic[] = [
  {
    id: 'ml',
    label: 'Machine Learning',
    lang: 'python',
    lesson: [
      {
        title: 'Fitting a line by least squares',
        note: 'The closed-form solution recovers the slope and intercept that generated the data, even with noise added.',
        lang: 'python',
        code: `import numpy as np

rng = np.random.default_rng(0)
x = np.linspace(0, 10, 60)
y = 2.4 * x + 1.7 + rng.normal(0, 1.5, x.size)

X = np.column_stack([np.ones_like(x), x])
w = np.linalg.lstsq(X, y, rcond=None)[0]

pred = X @ w
r2 = 1 - ((y - pred) ** 2).sum() / ((y - y.mean()) ** 2).sum()

print(f"intercept : {w[0]:.3f}   (true 1.700)")
print(f"slope     : {w[1]:.3f}   (true 2.400)")
print(f"R^2       : {r2:.4f}")`,
        output: `intercept : 1.826   (true 1.700)
slope     : 2.377   (true 2.400)
R^2       : 0.9581`,
      },
      {
        title: 'K-Means clustering with scikit-learn',
        note: 'Three blobs are generated and clustered; the recovered centres should line up with the true ones.',
        lang: 'python',
        code: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _, centres = make_blobs(
    n_samples=300, centers=3, cluster_std=0.9,
    random_state=7, return_centers=True,
)

km = KMeans(n_clusters=3, n_init=10, random_state=7).fit(X)

print("inertia :", round(km.inertia_, 2))
print("sizes   :", np.bincount(km.labels_))
for c in sorted(km.cluster_centers_.tolist()):
    print(f"  [{c[0]:7.3f}, {c[1]:7.3f}]")`,
      },
      {
        title: 'Gradient descent, step by step',
        note: 'Minimising a quadratic by hand shows exactly what an optimiser does inside every training loop.',
        lang: 'python',
        code: `def f(w):    return (w - 3) ** 2 + 2
def grad(w): return 2 * (w - 3)

w, lr = -4.0, 0.15
for step in range(31):
    if step % 5 == 0:
        print(f"step {step:>2}   w = {w:8.4f}   loss = {f(w):8.4f}")
    w -= lr * grad(w)

print(f"\\nconverged to w = {w:.6f}  (true minimum 3.0)")`,
      },
    ],
  },
  {
    id: 'c',
    label: 'C',
    lang: 'c',
    lesson: [
      {
        title: 'Pointers and arrays',
        note: 'An array name decays to a pointer to its first element — this is why pointer arithmetic indexes the array.',
        lang: 'c',
        code: `#include <stdio.h>

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int *p = a;

    for (int i = 0; i < 5; i++)
        printf("a[%d] = %2d   *(p+%d) = %2d\\n", i, a[i], i, *(p + i));

    printf("\\nsizeof(a) = %zu bytes, sizeof(p) = %zu bytes\\n",
           sizeof(a), sizeof(p));
    return 0;
}`,
        output: `a[0] = 10   *(p+0) = 10
a[1] = 20   *(p+1) = 20
a[2] = 30   *(p+2) = 30
a[3] = 40   *(p+3) = 40
a[4] = 50   *(p+4) = 50

sizeof(a) = 20 bytes, sizeof(p) = 8 bytes`,
      },
      {
        title: 'Recursion and the call stack',
        lang: 'c',
        code: `#include <stdio.h>

long long fact(int n) {
    return n <= 1 ? 1 : n * fact(n - 1);
}

int main(void) {
    for (int n = 1; n <= 10; n++)
        printf("%2d! = %lld\\n", n, fact(n));
    return 0;
}`,
      },
    ],
  },
  {
    id: 'cpp',
    label: 'C++ / DSA',
    lang: 'cpp',
    lesson: [
      {
        title: 'Binary search on a sorted vector',
        note: 'Halving the search space each step gives O(log n) — 20 steps is enough for a million elements.',
        lang: 'cpp',
        code: `#include <iostream>
#include <vector>

int binary_search(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1, steps = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        steps++;
        if (a[mid] == target) {
            std::cout << "found at " << mid << " in " << steps << " steps\\n";
            return mid;
        }
        if (a[mid] < target) lo = mid + 1;
        else                 hi = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> a;
    for (int i = 0; i < 1000000; i++) a.push_back(i * 2);
    binary_search(a, 999998);
    binary_search(a, 4);
}`,
      },
    ],
  },
  {
    id: 'java',
    label: 'Java / OOP',
    lang: 'java',
    lesson: [
      {
        title: 'Polymorphism in one screen',
        note: 'The same call site dispatches to different implementations at runtime — the core idea behind interfaces.',
        lang: 'java',
        code: `interface Shape {
    double area();
}

record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}

record Rect(double w, double h) implements Shape {
    public double area() { return w * h; }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2), new Rect(3, 4), new Circle(0.5) };
        double total = 0;
        for (Shape s : shapes) {
            System.out.printf("%-22s area = %.4f%n", s, s.area());
            total += s.area();
        }
        System.out.printf("%ntotal area = %.4f%n", total);
    }
}`,
      },
    ],
  },
  {
    id: 'sql',
    label: 'SQL',
    lang: 'sql',
    lesson: [
      {
        title: 'Grouping and aggregation',
        note: 'GROUP BY collapses rows into buckets; HAVING filters the buckets after aggregation, unlike WHERE.',
        lang: 'sql',
        code: `CREATE TABLE marks(student TEXT, subject TEXT, score INTEGER);

INSERT INTO marks VALUES
  ('Asha','Maths',91), ('Asha','Physics',84),
  ('Rahul','Maths',78), ('Rahul','Physics',88),
  ('Meera','Maths',95), ('Meera','Physics',72);

SELECT student,
       COUNT(*)        AS papers,
       ROUND(AVG(score),2) AS average,
       MAX(score)      AS best
FROM marks
GROUP BY student
HAVING AVG(score) > 80
ORDER BY average DESC;`,
      },
    ],
  },
];

export default function Playground(): ReactNode {
  const [active, setActive] = useState(0);
  const topic = TOPICS[active];

  return (
    <Layout
      title="Code Lab"
      description="Read the lesson on the left, write and run your own code on the right — Python, C, C++, Java, SQL and more, all in the browser.">
      <div className={styles.page}>
        <div className={styles.head}>
          <p className={styles.kicker}>Interactive</p>
          <h1 className={styles.title}>Code Lab</h1>
          <p className={styles.lead}>
            Lesson on the left, your own notebook on the right. Add cells, switch languages,
            run everything and download your work — no Colab tab, no local install. Python
            executes inside your browser; C, C++, Java, Go, Rust, SQL and the rest are
            compiled and run for you.
          </p>

          <div className={styles.topics}>
            {TOPICS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={i === active ? styles.topicActive : styles.topic}
                onClick={() => setActive(i)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <CodeLab
          key={topic.id}
          title={topic.label}
          lesson={topic.lesson}
          defaultLang={topic.lang}
          filename={`open-${topic.id}`}
        />

        <p className={styles.footnote}>
          The first Python run downloads the runtime (a few seconds), then it stays warm.
          Imported packages such as NumPy and scikit-learn are fetched on demand.
        </p>
      </div>
    </Layout>
  );
}
