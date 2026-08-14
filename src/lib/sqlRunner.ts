/**
 * SQL runs locally, in the browser, on a real SQLite engine (sql.js).
 *
 * No network round-trip and no rate limit — the reader can hammer the Run
 * button as often as they like. Results come back as an aligned table, the way
 * a notebook would print them.
 */

import type { RunResult } from './pyodide';

const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/';

type QueryResult = { columns: string[]; values: unknown[][] };

type SqlDatabase = {
  exec: (sql: string) => QueryResult[];
  close: () => void;
};

type SqlJs = { Database: new () => SqlDatabase };

declare global {
  interface Window {
    initSqlJs?: (opts: { locateFile: (f: string) => string }) => Promise<SqlJs>;
    __openSqlJs__?: Promise<SqlJs>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Could not load the SQL engine.'));
    document.head.appendChild(el);
  });
}

function getSqlJs(): Promise<SqlJs> {
  if (!window.__openSqlJs__) {
    window.__openSqlJs__ = loadScript(`${SQLJS}sql-wasm.js`).then(() => {
      if (!window.initSqlJs) throw new Error('SQL engine unavailable.');
      return window.initSqlJs({ locateFile: (file) => `${SQLJS}${file}` });
    });
  }
  return window.__openSqlJs__;
}

function cell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Uint8Array) return `<${value.length} bytes>`;
  return String(value);
}

/** Print one result set the way psql or a notebook would. */
function table({ columns, values }: QueryResult): string {
  const rows = values.map((row) => row.map(cell));
  const width = columns.map((name, i) =>
    Math.max(name.length, ...rows.map((row) => row[i]?.length ?? 0)),
  );

  const line = (parts: string[]) =>
    parts.map((part, i) => part.padEnd(width[i])).join('  ');

  const out = [line(columns), width.map((w) => '-'.repeat(w)).join('  ')];
  rows.forEach((row) => out.push(line(row)));
  out.push(`(${rows.length} ${rows.length === 1 ? 'row' : 'rows'})`);
  return out.join('\n');
}

export async function runSql(
  code: string,
  onProgress?: (msg: string) => void,
): Promise<RunResult> {
  let db: SqlDatabase | null = null;
  try {
    onProgress?.('Starting SQLite…');
    const SQL = await getSqlJs();
    onProgress?.('Running…');

    db = new SQL.Database();
    const results = db.exec(code);

    if (results.length === 0) {
      return { ok: true, output: 'Statements ran. No rows returned.' };
    }
    return { ok: true, output: results.map(table).join('\n\n') };
  } catch (err) {
    return { ok: false, output: String(err).replace(/^Error:\s*/, '') };
  } finally {
    db?.close();
  }
}
