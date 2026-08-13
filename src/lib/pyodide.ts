/**
 * Shared in-browser Python runtime (Pyodide).
 * Loaded lazily on first run and reused across every cell on the page.
 */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type PyodideLike = {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike>;
    __openPyodide__?: Promise<PyodideLike>;
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
    el.onerror = () => reject(new Error('Could not load the Python runtime.'));
    document.head.appendChild(el);
  });
}

export function getPyodide(): Promise<PyodideLike> {
  if (!window.__openPyodide__) {
    window.__openPyodide__ = loadScript(`${PYODIDE_URL}pyodide.js`).then(() => {
      if (!window.loadPyodide) throw new Error('Python runtime unavailable.');
      return window.loadPyodide({ indexURL: PYODIDE_URL });
    });
  }
  return window.__openPyodide__;
}

export type RunResult = { output: string; ok: boolean };

export async function runPython(
  code: string,
  onProgress?: (msg: string) => void,
): Promise<RunResult> {
  try {
    onProgress?.('Starting Python…');
    const py = await getPyodide();

    onProgress?.('Fetching imported packages…');
    await py.loadPackagesFromImports(code);
    onProgress?.('Running…');

    let buffer = '';
    py.setStdout({ batched: (s) => (buffer += s + '\n') });
    py.setStderr({ batched: (s) => (buffer += s + '\n') });

    const result = await py.runPythonAsync(code);
    if (result !== undefined && result !== null) buffer += String(result) + '\n';

    return { output: buffer || '(no output)', ok: true };
  } catch (err) {
    return { output: String(err), ok: false };
  }
}
