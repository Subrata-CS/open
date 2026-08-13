/**
 * JavaScript runs locally in a throwaway Web Worker.
 * No network, no server, and a hung loop can be terminated.
 */

import type { RunResult } from './pyodide';

const WORKER_SRC = `
self.onmessage = (e) => {
  const lines = [];
  const fmt = (v) => {
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v, null, 2) ?? String(v); }
    catch { return String(v); }
  };
  const write = (...args) => lines.push(args.map(fmt).join(' '));

  const console = {
    log: write, info: write, warn: write, debug: write,
    error: (...a) => lines.push('Error: ' + a.map(fmt).join(' ')),
    table: write,
  };

  try {
    const result = new Function('console', '"use strict";' + e.data)(console);
    if (result !== undefined) lines.push(fmt(result));
    self.postMessage({ ok: true, output: lines.join('\\n') });
  } catch (err) {
    lines.push(String(err && err.stack ? err.stack : err));
    self.postMessage({ ok: false, output: lines.join('\\n') });
  }
};
`;

export function runJavaScript(code: string, timeoutMs = 10000): Promise<RunResult> {
  return new Promise((resolve) => {
    let worker: Worker;
    let url: string;

    try {
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
      worker = new Worker(url);
    } catch {
      resolve({ ok: false, output: 'This browser cannot run the JavaScript sandbox.' });
      return;
    }

    const finish = (res: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(res);
    };

    const timer = setTimeout(
      () => finish({ ok: false, output: `Stopped after ${timeoutMs / 1000}s — is there an endless loop?` }),
      timeoutMs,
    );

    worker.onmessage = (e: MessageEvent<{ ok: boolean; output: string }>) =>
      finish({ ok: e.data.ok, output: e.data.output || '(no output)' });

    worker.onerror = (e) => finish({ ok: false, output: e.message || 'Script error' });

    worker.postMessage(code);
  });
}
