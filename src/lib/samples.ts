/**
 * Small built-in datasets, written straight into the Python filesystem.
 * Kept tiny on purpose — they load instantly and need no network.
 */

export type SampleDataset = {
  name: string;
  file: string;
  rows: number;
  blurb: string;
  csv: string;
  snippet: string;
};

function build(rows: string[][], header: string[]): string {
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n') + '\n';
}

/* ---------------- iris (classic classification) ---------------- */

const IRIS_ROWS: string[][] = [
  ['5.1', '3.5', '1.4', '0.2', 'setosa'], ['4.9', '3.0', '1.4', '0.2', 'setosa'],
  ['4.7', '3.2', '1.3', '0.2', 'setosa'], ['4.6', '3.1', '1.5', '0.2', 'setosa'],
  ['5.0', '3.6', '1.4', '0.2', 'setosa'], ['5.4', '3.9', '1.7', '0.4', 'setosa'],
  ['4.6', '3.4', '1.4', '0.3', 'setosa'], ['5.0', '3.4', '1.5', '0.2', 'setosa'],
  ['4.4', '2.9', '1.4', '0.2', 'setosa'], ['4.9', '3.1', '1.5', '0.1', 'setosa'],
  ['5.4', '3.7', '1.5', '0.2', 'setosa'], ['4.8', '3.4', '1.6', '0.2', 'setosa'],
  ['7.0', '3.2', '4.7', '1.4', 'versicolor'], ['6.4', '3.2', '4.5', '1.5', 'versicolor'],
  ['6.9', '3.1', '4.9', '1.5', 'versicolor'], ['5.5', '2.3', '4.0', '1.3', 'versicolor'],
  ['6.5', '2.8', '4.6', '1.5', 'versicolor'], ['5.7', '2.8', '4.5', '1.3', 'versicolor'],
  ['6.3', '3.3', '4.7', '1.6', 'versicolor'], ['4.9', '2.4', '3.3', '1.0', 'versicolor'],
  ['6.6', '2.9', '4.6', '1.3', 'versicolor'], ['5.2', '2.7', '3.9', '1.4', 'versicolor'],
  ['5.0', '2.0', '3.5', '1.0', 'versicolor'], ['5.9', '3.0', '4.2', '1.5', 'versicolor'],
  ['6.3', '3.3', '6.0', '2.5', 'virginica'], ['5.8', '2.7', '5.1', '1.9', 'virginica'],
  ['7.1', '3.0', '5.9', '2.1', 'virginica'], ['6.3', '2.9', '5.6', '1.8', 'virginica'],
  ['6.5', '3.0', '5.8', '2.2', 'virginica'], ['7.6', '3.0', '6.6', '2.1', 'virginica'],
  ['4.9', '2.5', '4.5', '1.7', 'virginica'], ['7.3', '2.9', '6.3', '1.8', 'virginica'],
  ['6.7', '2.5', '5.8', '1.8', 'virginica'], ['7.2', '3.6', '6.1', '2.5', 'virginica'],
  ['6.5', '3.2', '5.1', '2.0', 'virginica'], ['6.4', '2.7', '5.3', '1.9', 'virginica'],
];

/* ---------------- student marks (grouping / statistics) ---------------- */

const NAMES = [
  'Asha', 'Rahul', 'Meera', 'Imran', 'Priya', 'Dev', 'Nita', 'Sameer',
  'Kavya', 'Arjun', 'Ritu', 'Farhan', 'Divya', 'Manish', 'Sneha', 'Vikram',
];
const SUBJECTS = ['Maths', 'Physics', 'Chemistry'];

const MARK_ROWS: string[][] = [];
let seed = 42;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
for (const name of NAMES) {
  for (const subject of SUBJECTS) {
    const score = Math.round(48 + rand() * 50);
    const hours = Math.round((2 + rand() * 8) * 10) / 10;
    MARK_ROWS.push([name, subject, String(score), String(hours)]);
  }
}

/* ---------------- server logs (parsing / networks) ---------------- */

const PATHS = ['/', '/docs', '/login', '/api/user', '/api/search', '/static/app.js'];
const CODES = ['200', '200', '200', '200', '304', '404', '500'];
const LOG_ROWS: string[][] = [];
for (let i = 0; i < 60; i++) {
  const hour = String(Math.floor(rand() * 24)).padStart(2, '0');
  const minute = String(Math.floor(rand() * 60)).padStart(2, '0');
  LOG_ROWS.push([
    `2026-03-11T${hour}:${minute}:00`,
    PATHS[Math.floor(rand() * PATHS.length)],
    CODES[Math.floor(rand() * CODES.length)],
    String(Math.round(8 + rand() * 900)),
  ]);
}

export const SAMPLES: SampleDataset[] = [
  {
    name: 'Iris flowers',
    file: 'iris.csv',
    rows: IRIS_ROWS.length,
    blurb: 'Classic classification set — four measurements, three species.',
    csv: build(IRIS_ROWS, ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species']),
    snippet: `import pandas as pd

df = pd.read_csv("iris.csv")
print(df.head())
print()
print(df.groupby("species")[["petal_length", "petal_width"]].mean())`,
  },
  {
    name: 'Student marks',
    file: 'marks.csv',
    rows: MARK_ROWS.length,
    blurb: 'Names, subjects, scores and study hours — good for grouping and correlation.',
    csv: build(MARK_ROWS, ['student', 'subject', 'score', 'hours_studied']),
    snippet: `import pandas as pd

df = pd.read_csv("marks.csv")
print(df.describe())
print()
print(df.groupby("subject")["score"].agg(["mean", "min", "max"]))
print()
print("score vs hours correlation:",
      round(df["score"].corr(df["hours_studied"]), 3))`,
  },
  {
    name: 'Server logs',
    file: 'logs.csv',
    rows: LOG_ROWS.length,
    blurb: 'Request timestamps, paths, status codes and latency — parsing practice.',
    csv: build(LOG_ROWS, ['timestamp', 'path', 'status', 'latency_ms']),
    snippet: `import pandas as pd

df = pd.read_csv("logs.csv", parse_dates=["timestamp"])
print(df["status"].value_counts())
print()
print(df.groupby("path")["latency_ms"].mean().sort_values(ascending=False))`,
  },
];
