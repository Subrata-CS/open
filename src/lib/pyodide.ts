/**
 * Shared in-browser Python runtime (Pyodide).
 * Loaded lazily on first run and reused across every cell on the page.
 */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type PyodideLike = {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  loadPackage: (names: string | string[]) => Promise<void>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  FS: {
    writeFile: (path: string, data: Uint8Array | string, opts?: { encoding?: string }) => void;
    readdir: (path: string) => string[];
    unlink: (path: string) => void;
  };
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


/** Working directory inside the Python filesystem — this is where uploads land. */
export const PY_CWD = '/home/pyodide';

export type DataFile = { name: string; size: number };

/**
 * Copy uploaded files into the Python filesystem so notebooks can read them
 * exactly as they would locally:  pd.read_csv("titanic.csv")
 */
export async function writeDataFiles(files: File[]): Promise<DataFile[]> {
  const py = await getPyodide();
  const written: DataFile[] = [];

  for (const file of files) {
    const buf = new Uint8Array(await file.arrayBuffer());
    py.FS.writeFile(`${PY_CWD}/${file.name}`, buf);
    written.push({ name: file.name, size: file.size });
  }
  return written;
}

/** Write a string straight to a file (used for the built-in sample datasets). */
export async function writeTextFile(name: string, text: string): Promise<DataFile> {
  const py = await getPyodide();
  py.FS.writeFile(`${PY_CWD}/${name}`, text, { encoding: 'utf8' });
  return { name, size: new Blob([text]).size };
}

export async function removeDataFile(name: string): Promise<void> {
  const py = await getPyodide();
  try {
    py.FS.unlink(`${PY_CWD}/${name}`);
  } catch {
    /* already gone */
  }
}
